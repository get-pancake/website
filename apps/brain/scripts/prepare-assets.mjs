import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../../../", import.meta.url);
const output = new URL("../public/", import.meta.url);
await mkdir(output, { recursive: true });
// Build artifacts come from the same versioned v3 assets as getpancake.ai.
for (const name of ["lp", "og-image.png"]) {
  await cp(new URL(`public/${name}`, root), new URL(name, output), { recursive: true });
}
await cp(new URL("app/icon.png", root), new URL("icon.png", output));
console.log(`Prepared shared Pancake assets in ${fileURLToPath(output)}`);
