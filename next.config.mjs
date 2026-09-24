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
      ...dead.map((path) => ({
        source: `/${path}`,
        destination: "/",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
