import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { INDEXNOW_ENDPOINT, INDEXNOW_KEY } from "@/lib/indexnow";
import { getAllPosts, publishedAt } from "@/lib/posts";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily publish job (2026-11-04). Vercel Cron calls it at 13:05 UTC (vercel.json), five minutes
 * after scheduled posts go live (lib/posts.ts publishedAt). The hourly revalidation would show
 * them anyway, but only after the first visit past 13:00; this makes them appear on time:
 *   1. revalidates /blog, every post page (so links and "Keep reading" to the new posts appear),
 *      the sitemap and the RSS feed;
 *   2. requests the new posts, /blog, the sitemap and the feed once, so pages are rebuilt before
 *      the first reader or crawler arrives;
 *   3. sends the new URLs to IndexNow (lib/indexnow.ts).
 * Only Vercel Cron may call it: Vercel sends `Authorization: Bearer $CRON_SECRET` (a Production
 * environment variable). Anything else gets 401, and nothing runs while the secret is unset.
 */

/** Posts that went live in the last 26 hours count as new: a late or retried run still sends them. */
const NEW_WINDOW_MS = 26 * 60 * 60 * 1000;

async function status(url: string, init?: RequestInit): Promise<number> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    return res.status;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const fresh = getAllPosts().filter((post) => {
    const age = now - publishedAt(post.date).getTime();
    return age >= 0 && age < NEW_WINDOW_MS;
  });

  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/rss.xml");

  // Production warms and pings the public site; a preview or local run warms itself and pings nobody.
  const production = process.env.VERCEL_ENV === "production";
  const origin = production ? SITE_ORIGIN : new URL(request.url).origin;
  const postUrls = fresh.map((post) => `${origin}/blog/${post.slug}`);
  const warm = await Promise.all(
    [...postUrls, `${origin}/blog`, `${origin}/sitemap.xml`, `${origin}/blog/rss.xml`].map(
      async (url) => [url, await status(url)] as const,
    ),
  );

  let indexnow: number | "skipped" = "skipped";
  if (production && fresh.length > 0) {
    indexnow = await status(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_ORIGIN).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: postUrls,
      }),
    });
  }

  return NextResponse.json({ published: fresh.map((post) => post.slug), warmed: warm, indexnow });
}
