/** @type {import('next').NextConfig} */
const nextConfig = {
  /** In dev, disable webpack filesystem cache — reduces stale chunk manifest mismatches. */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    /** Same as Vite `?raw` — used by `PancakeMonster` SVG morph sources. */
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
  async redirects() {
    const dead = [
      "neo-brutalism",
      "dark-mode",
      "bold-typography",
      "motion-design",
      "ai-native",
      "retrofuturism",
      "sustainable",
    ];
    return [
      { source: "/favicon.ico", destination: "/icon.png", permanent: false },
      { source: "/contact", destination: "/support", statusCode: 301 },
      // Influencer program archived (see app/_influencers). Temporary redirects
      // only — clients must not cache these past a future revival.
      { source: "/creators", destination: "/", permanent: false },
      { source: "/influencers", destination: "/", permanent: false },
      // llms.txt (and possibly LLM answers built from it) link /signup;
      // the route never existed — send those visitors to the real signup.
      { source: "/signup", destination: "https://app.getpancake.ai", permanent: false },
      // People type getpancake.ai/login: send them to the app (temporary, so
      // it can later point at a dedicated app login route).
      { source: "/login", destination: "https://app.getpancake.ai", permanent: false },
      { source: "/signin", destination: "https://app.getpancake.ai", permanent: false },
      { source: "/sign-in", destination: "https://app.getpancake.ai", permanent: false },
      // Removed or moved pages → the closest live page, 301 (founder rule
      // 2026-09-24: never leave a known URL on a 404; every removal or URL
      // change ships with a 301 here).
      // Deleted in 7d4437e (duplicate of the Cofounder.AI comparison).
      { source: "/blog/pancake-vs-cofounder", destination: "/blog/pancake-vs-cofounder-ai", statusCode: 301 },
      // Deleted in 222b8e8 (unverifiable revenue claim).
      { source: "/blog/autonomous-company-at-30k-mrr", destination: "/blog/autonomous-company-benchmark-2026", statusCode: 301 },
      // The GTM report's first address (d4d95bf) before it moved to /ai-gtm-report.
      { source: "/report", destination: "/ai-gtm-report", statusCode: 301 },
      // From the Search Console "Not found (404)" export (2026-09-24,
      // raw/getpancake-ai-search-console-404-2026-09-24.csv):
      // the privacy page's old address…
      { source: "/privacy-policy", destination: "/privacy", statusCode: 301 },
      // …and "/month", which Googlebot lifts from the "$99/month" string in
      // the page payload (not a real link) — the pricing page answers it.
      { source: "/month", destination: "/pricing", statusCode: 301 },
      ...dead.map((path) => ({
        source: `/${path}`,
        destination: "/",
        permanent: true,
      })),
      // Blog posts retired 2026-09-24 (founder rule: every removed page ships
      // a 301 to the closest live page; scripts/url-guard.mjs enforces it).
      // Near-duplicate of the aicofounders.co comparison:
      { source: "/blog/pancake-vs-aicofounders", destination: "/blog/pancake-vs-ai-cofounders", statusCode: 301 },
      // Slugs that never existed but get Search Console impressions (LLM-invented
      // or mistyped links, 2026-09-24 Performance report) — send them to the post
      // they clearly mean.
      { source: "/blog/pancake-vs-viktor", destination: "/blog/viktor-vs-pancake", statusCode: 301 },
      { source: "/blog/what-is-an-agentic-operating-system", destination: "/blog/what-is-agentic-operating-system", statusCode: 301 },
      { source: "/blog/onemancompany", destination: "/blog/pancake-vs-onemancompany", statusCode: 301 },
      { source: "/blog/w26-solo-founders", destination: "/blog/yc-w26-solo-founders", statusCode: 301 },
      { source: "/blog/what-is-an-ai-first-startup", destination: "/blog/what-is-ai-first-startup", statusCode: 301 },
    ];
  },
};

export default nextConfig;
