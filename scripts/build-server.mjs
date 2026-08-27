// Bundles src/server/chat.ts into the single deployable api/chat.js.
//
// The source lives under src/server/ so Vercel never auto-discovers loose .ts
// files with extensionless/relative imports (which broke at runtime). esbuild
// inlines all relative `.ts`/`.json` modules into one self-contained file that
// Node can load directly on Vercel. Node builtins (fetch, Buffer, etc.) stay
// referenced as globals/externals.
//
// Usage: node scripts/build-server.mjs

import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await build({
  entryPoints: [path.join(root, "src", "server", "chat.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile: path.join(root, "api", "chat.js"),
  logLevel: "warning",
  legalComments: "none",
  absWorkingDir: root,
});

console.log("✓ Built api/chat.js");