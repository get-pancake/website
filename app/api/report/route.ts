import { NextResponse } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCachedScan, setCachedScan } from "@/lib/scan/cache";
import { checkPromptOnChatGPT, isConfigured, rankedKeywords } from "@/lib/scan/dataforseo";
import { deriveChecks, extractSnippets, fetchSite } from "@/lib/scan/fetch-site";
import { analyzeIcp, analyzeSite } from "@/lib/scan/analyze";
import { validateScanTarget } from "@/lib/scan/validate";
import { SITE_HOST } from "@/lib/site-config.mjs";
import type {
  Analysis,
  CommunityItem,
  GoogleRow,
  RankedKeywords,
  ScanEvent,
} from "@/lib/scan/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Worst honest path: site fetch + keyword race + Claude retry (55s + 40s) +
// live citation checks (30s cap). 180 leaves margin so the platform never
// kills the function mid-stream — that's what leaves spinners on screen.
export const maxDuration = 180;

/**
 * The free AI GTM report scan. One POST, one SSE stream: deterministic site
 * checks land in ~2s, the Claude "Brain" pass lands under 15s, real ChatGPT
 * citation checks trickle in behind (when DataForSEO is configured). Spend is
 * bounded by a per-IP limit, a global daily cap, a per-domain 24h cache, and
 * fixed per-scan API budgets — nothing loops, nothing retries a paid call.
 */

// How long the Claude pass waits for real rankings before going without
// them. Every second here is a second the visitor stares at the ICP dive —
// DataForSEO usually answers in 2-4s, so 3.5s catches most of the value.
const RACE_KEYWORDS_MS = 3500;

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function computeScores(
  checks: { pass: boolean }[],
  citedCount: number,
  citationTotal: number,
  keywords: RankedKeywords | null,
  analysis: Analysis,
  realRankedRows: number,
): {
  score: number;
  potential: number;
  breakdown: {
    ai: { score: number; max: number };
    google: { score: number; max: number };
    readiness: { score: number; max: number };
  };
} {
  const checkScore = (checks.filter((c) => c.pass).length / checks.length) * 100;
  const citationScore = citationTotal > 0 ? (citedCount / citationTotal) * 100 : analysis.content_readiness;
  const googleScore = keywords
    ? Math.min(100, keywords.top10 * 9 + (keywords.totalKeywords > 0 ? 15 : 0))
    : analysis.content_readiness;
  const blended = 0.25 * checkScore + 0.4 * citationScore + 0.35 * googleScore;
  const score = Math.min(97, Math.max(3, Math.round(blended)));
  // The same weights, surfaced as the dashboard's three sub-scores.
  const breakdown = {
    ai: { score: Math.round(0.4 * citationScore), max: 40 },
    google: { score: Math.round(0.35 * googleScore), max: 35 },
    readiness: { score: Math.round(0.25 * checkScore), max: 25 },
  };
  // Same formula under the "gaps closed" scenario the report lays out: every
  // check fixed, cited in at least half the buyer questions, the shown
  // within-reach searches won. An estimate, never a promise — copy says so.
  const potentialGoogle = keywords
    ? Math.min(100, (keywords.top10 + realRankedRows) * 9 + 15)
    : Math.max(googleScore, 60);
  const potentialBlended = 0.25 * 100 + 0.4 * Math.max(citationScore, 50) + 0.35 * potentialGoogle;
  const potential = Math.min(97, Math.max(Math.round(potentialBlended), score + 5));
  return { score, potential, breakdown };
}

/**
 * "mini perfumes wholesale" vs "miniature perfumes wholesale" is one search,
 * not two. Tokens match on equality or a shared 4+ char prefix; two terms are
 * duplicates when most tokens of the longer one match.
 */
function nearDup(a: string, b: string): boolean {
  const tok = (s: string) => s.toLowerCase().split(/[^a-z0-9à-öø-ÿ]+/).filter(Boolean);
  const ta = tok(a);
  const tb = tok(b);
  if (!ta.length || !tb.length) return false;
  const match = (x: string, y: string) =>
    x === y || (x.length >= 4 && y.startsWith(x)) || (y.length >= 4 && x.startsWith(y));
  const hits = ta.filter((x) => tb.some((y) => match(x, y))).length;
  return hits / Math.max(ta.length, tb.length) >= 0.75;
}

/**
 * Hallucination guard for the communities card: Reddit ONLY — anything that
 * is not an r/name is dropped outright (no Facebook groups, no forums).
 * Subreddits are checked against Reddit's public about.json: a hard 404
 * drops the item; a verified subscriber count ships as exact data; when
 * Reddit blocks the check (it 403s most datacenter clients) the model's
 * approximate figure ships instead, flagged `membersEstimated` and rendered
 * with a ~ prefix.
 */
async function verifyCommunities(
  items: { name: string; why: string; approx_members: number | null }[],
): Promise<CommunityItem[]> {
  const results = await Promise.all(
    items.map(async (c): Promise<CommunityItem | null> => {
      const approx: CommunityItem =
        typeof c.approx_members === "number" && c.approx_members > 0
          ? { name: c.name, why: c.why, members: c.approx_members, membersEstimated: true }
          : { name: c.name, why: c.why };
      const m = c.name.trim().match(/^r\/([A-Za-z0-9_]{2,30})$/);
      if (!m) return null;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500);
      try {
        const res = await fetch(`https://www.reddit.com/r/${m[1]}/about.json`, {
          headers: { "User-Agent": `pancake-gtm-report/1.0 (${SITE_HOST})` },
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (res.status === 404) return null; // does not exist — never ship it
        if (!res.ok) return approx;
        const data = (await res.json()) as { data?: { subscribers?: number } };
        const members = data.data?.subscribers;
        return typeof members === "number" && members > 0
          ? { name: c.name, why: c.why, members }
          : approx;
      } catch {
        return approx;
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  return results.filter((c): c is CommunityItem => c !== null);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const target = validateScanTarget(body.url);
  if (!target.ok) {
    return NextResponse.json({ error: target.reason }, { status: 400 });
  }

  const cached = await getCachedScan(target.host);
  const ip = getClientIp(request);

  if (!cached) {
    const perIp = rateLimit(`report:scan:${ip}`, 3, 10 * 60 * 1000);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "You're scanning fast. Give it a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }
    const dailyCap = Number(process.env.REPORT_DAILY_SCAN_CAP || 200);
    const daily = rateLimit("report:daily:global", dailyCap, 24 * 60 * 60 * 1000);
    if (!daily.ok) {
      return NextResponse.json(
        { error: "Today's free scans are all used up. Come back tomorrow." },
        { status: 429, headers: { "Retry-After": String(daily.retryAfter) } },
      );
    }
  }

  const encoder = new TextEncoder();
  const collected: ScanEvent[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (ev: ScanEvent) => {
        if (closed) return;
        if (ev.type !== "ping") collected.push(ev); // heartbeats never enter the cache
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        } catch {
          closed = true; // client went away — stop pushing, let the scan wind down
        }
      };
      // Heartbeat: the Claude pass and citation checks can go 30-60s without a
      // real event. Pings let the client tell "still working" from "dead".
      const heartbeat = setInterval(() => send({ type: "ping" }), 8000);
      const finish = () => {
        clearInterval(heartbeat);
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Cache hit: replay the identical event sequence, marked as cached.
      if (cached) {
        for (const ev of cached) {
          if (ev.type === "done") send({ ...ev, cached: true });
          else send(ev);
        }
        finish();
        return;
      }

      try {
        send({ type: "status", label: `Knocking on ${target.host}…` });

        // Rankings need only the domain — start alongside the site fetch.
        const keywordsPromise: Promise<RankedKeywords | null> = rankedKeywords(target.host);

        const site = await fetchSite(target.url, target.host);
        if (!site) {
          send({
            type: "error",
            code: "unreachable",
            message: `We knocked at ${target.host}. Nobody answered.`,
          });
          finish();
          return;
        }

        send({
          type: "meta",
          title: site.title,
          ogImage: site.ogImage,
          favicon: site.favicon,
          description: site.metaDescription,
          schemaTypes: site.schemaTypes,
          snippets: extractSnippets(site.textExtract),
        });
        send({ type: "status", label: "Checking who gets in: AI crawlers, llms.txt, structured data…" });
        const checks = deriveChecks(site);
        for (const check of checks) send({ type: "check", ...check });

        // Fast ICP pass, in parallel with everything below — the theater's
        // "Finding your ICP" beat must land on schedule, not after the ~30s
        // full analysis. Fire-and-forget; send() is a no-op once closed.
        const icpFast = analyzeIcp(site)
          .then((r) => {
            if (r?.icp) send({ type: "icp", company: r.name || target.host, icp: r.icp });
          })
          .catch(() => {});

        send({ type: "status", label: `Building a mini Brain for ${target.host}…` });
        const keywordsEarly = await Promise.race([
          keywordsPromise,
          new Promise<null>((r) => setTimeout(() => r(null), RACE_KEYWORDS_MS)),
        ]);

        send({
          type: "status",
          label: `Reading ${target.host}: what you sell, who buys, how they search…`,
        });
        const analysis = await analyzeSite(site, keywordsEarly);
        send({
          type: "brain",
          company: analysis.company.name || target.host,
          icp: analysis.company.icp,
          prompts: analysis.buyer_prompts.map((p) => p.prompt),
        });

        // Google card: real rankings when they arrived, Claude's read otherwise.
        const keywords = keywordsEarly ?? (await keywordsPromise);
        let realRankedRows = 0;
        if (keywords) {
          // A marketplace ranks for its sellers' brand names — Claude selects
          // which real within-reach keywords are money searches for THIS company.
          const selected = new Set(analysis.relevant_keywords.map((k) => k.toLowerCase().trim()));
          const relevant = selected.size
            ? keywords.withinReach.filter((k) => selected.has(k.keyword.toLowerCase().trim()))
            : keywords.withinReach;
          const rows: GoogleRow[] = [];
          for (const k of relevant) {
            if (rows.length >= 6) break;
            if (rows.some((r) => nearDup(r.term, k.keyword))) continue;
            rows.push({
              term: k.keyword,
              position: k.position,
              volume: k.volume,
              detail: `position ${k.position} · ${k.volume.toLocaleString()} searches/mo`,
            });
          }
          realRankedRows = rows.length;
          // Thin real table (a marketplace's rankings are mostly other brands):
          // pad with the money searches this company *should* own, clearly
          // marked, so the card never shrinks to one odd row.
          if (rows.length < 5) {
            for (const k of analysis.money_keywords) {
              if (rows.length >= 6) break;
              if (rows.some((r) => nearDup(r.term, k.keyword))) continue;
              rows.push({
                term: k.keyword,
                position: null,
                volume: null,
                detail: "not ranking yet",
              });
            }
          }
          const stats = `Ranks for ${keywords.totalKeywords.toLocaleString()} keywords, ${keywords.top10} in the top 10.`;
          send({
            type: "google",
            rows,
            toWin: rows.length,
            commentary: analysis.google_commentary
              ? `${stats} ${analysis.google_commentary}`
              : stats,
          });
        } else {
          send({
            type: "google",
            rows: analysis.money_keywords.map((k) => ({
              term: k.keyword,
              position: null,
              volume: null,
              detail: k.why_it_matters,
            })),
            toWin: analysis.money_keywords.length,
            estimated: true,
            commentary: analysis.google_commentary,
          });
        }

        // Outbound dimension: signals to monitor + verified communities.
        send({ type: "status", label: "Spotting buying signals…" });
        const communities = await verifyCommunities(analysis.communities);
        send({ type: "signals", signals: analysis.buying_signals, communities });

        send({ type: "status", label: "Asking ChatGPT what your buyers ask…" });

        // Citation checks: real ChatGPT answers when DataForSEO is configured,
        // Claude's per-prompt estimate otherwise. Fixed budget, fully parallel.
        let citedCount = 0;
        let liveCitations = 0;
        const prompts = analysis.buyer_prompts;
        const liveBudget = isConfigured()
          ? Math.min(prompts.length, Number(process.env.REPORT_PROMPTS_TO_CHECK || 10))
          : 0;

        await Promise.all(
          prompts.map(async (p, index) => {
            if (index < liveBudget) {
              const result = await checkPromptOnChatGPT(p.prompt, target.host, analysis.company.name);
              if (result) {
                if (result.cited) citedCount += 1;
                liveCitations += 1;
                send({
                  type: "citation",
                  index,
                  cited: result.cited,
                  detail: result.cited
                    ? "ChatGPT names you in this answer."
                    : result.citedDomains.length
                      ? `Cited instead: ${result.citedDomains.join(", ")}`
                      : "You don't come up in this answer.",
                  citedDomains: result.citedDomains,
                });
                return;
              }
            }
            if (p.likely_cited) citedCount += 1;
            send({
              type: "citation",
              index,
              cited: p.likely_cited,
              detail: p.reason,
              estimated: true,
            });
          }),
        );

        send({ type: "status", label: "Adding it up…" });
        send({
          type: "opportunities",
          count: analysis.opportunities.length,
          items: analysis.opportunities,
        });
        const scores = computeScores(
          checks,
          citedCount,
          prompts.length,
          keywords,
          analysis,
          realRankedRows,
        );
        send({
          type: "score",
          value: scores.score,
          potential: scores.potential,
          breakdown: scores.breakdown,
        });
        send({
          type: "done",
          domain: target.host,
          // "live" only when live data actually landed — keys being configured
          // isn't enough (e.g. an unverified DataForSEO account 403s every call).
          mode: keywords || liveCitations > 0 ? "live" : "estimated",
        });

        await setCachedScan(target.host, collected);
      } catch (err) {
        console.error("Report scan failed:", err);
        send({
          type: "error",
          code: "failed",
          message: "The scan tripped on our side. Your site is fine. Run it again.",
        });
      } finally {
        finish();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
