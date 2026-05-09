/**
 * Usage: node scripts/remove-bg.mjs <API_KEY>
 * Calls the remove.bg API for every JPG listed in INPUTS and
 * saves a transparent PNG next to this script's output directory.
 *
 * Free tier: 50 previews/month (0.25 MP). Paid tier for full-res.
 * Get your key at https://www.remove.bg/api
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const PUBLIC = join(ROOT, "public");
const OUT = join(PUBLIC, "try-on-overlays");

mkdirSync(OUT, { recursive: true });

const API_KEY = process.argv[2];
if (!API_KEY) {
  console.error("Usage: node scripts/remove-bg.mjs <YOUR_REMOVE_BG_API_KEY>");
  process.exit(1);
}

const INPUTS = [
  {
    src: "category products images/Italian Customized Charms Bracelet.jpg",
    out: "italian-charms-bracelet.png",
  },
  {
    src: "category products images/Italian Customized Charms Bracelet (Gold).jpg",
    out: "italian-charms-bracelet-gold.png",
  },
  {
    src: "category products images/18K Gold plated Bracelet.png",
    out: "18k-gold-plated-bracelet.png",
  },
];

for (const { src, out } of INPUTS) {
  const srcPath = join(PUBLIC, src);
  const outPath = join(OUT, out);

  console.log(`Processing: ${src}`);

  let fileBuffer;
  try {
    fileBuffer = readFileSync(srcPath);
  } catch {
    console.warn(`  ⚠ File not found, skipping: ${srcPath}`);
    continue;
  }

  const formData = new FormData();
  formData.append(
    "image_file",
    new Blob([fileBuffer], { type: "image/jpeg" }),
    out
  );
  formData.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": API_KEY },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ✗ API error ${res.status}: ${text}`);
    continue;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`  ✓ Saved → public/try-on-overlays/${out}`);
}

console.log("\nDone. Update products.ts tryOnImage fields to:");
for (const { out } of INPUTS) {
  console.log(`  /try-on-overlays/${out}`);
}
