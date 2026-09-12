import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));

/** Share the real landing components; deploy this app independently on Vercel. */
export default {
  webpack: (config) => { config.cache = false; return config; },
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  env: { NEXT_PUBLIC_BRAIN_DEPLOYMENT_ENV: process.env.VERCEL_ENV || "development" },
  experimental: { externalDir: true, outputFileTracingRoot: path.resolve(directory, "../..") },
  async headers() {
    return process.env.VERCEL_ENV === "production" ? [] : [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }];
  },
};
