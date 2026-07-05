import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, "../public/brand");

const renderSvg = async (svgPath, outputPath, width, height) => {
  const svg = readFileSync(join(brandDir, svgPath));
  await sharp(svg).resize(width, height).png().toFile(join(brandDir, outputPath));
  console.log(`Generated ${outputPath}`);
};

await renderSvg("icon.svg", "icon-192.png", 192, 192);
await renderSvg("icon.svg", "icon-512.png", 512, 512);
await renderSvg("apple-touch-icon.svg", "apple-touch-icon.png", 180, 180);
await renderSvg("logo-mark.svg", "favicon.png", 32, 32);

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0B0B0C"/>
  <text x="600" y="280" text-anchor="middle" fill="#F4F4F5" font-family="system-ui,sans-serif" font-size="56" font-weight="700">JobTrack AI</text>
  <text x="600" y="360" text-anchor="middle" fill="#A1A1AA" font-family="system-ui,sans-serif" font-size="28">Organize sua carreira com Inteligência Artificial</text>
</svg>`;
writeFileSync(join(brandDir, "og-temp.svg"), ogSvg);
await sharp(readFileSync(join(brandDir, "og-temp.svg"))).png().toFile(join(brandDir, "og-image.png"));
console.log("Generated og-image.png");
