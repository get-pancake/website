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
      { source: "/contact", destination: "/support", permanent: true },
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
      // Deleted in 7d4437e (duplicate of the Cofounder.AI comparison) and
      // still known to search engines — pass its signals to the survivor.
      {
        source: "/blog/pancake-vs-cofounder",
        destination: "/blog/pancake-vs-cofounder-ai",
        permanent: true,
      },
      ...dead.map((path) => ({
        source: `/${path}`,
        destination: "/",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
