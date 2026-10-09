// Screenshots dist/index.html at 3 widths into screens/latest/. Used by the Claude Code Stop hook and `npm run shots`.
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const page = resolve("dist/index.html");
if (!existsSync(page)) { console.log("shots: no dist/index.html yet, skipping"); process.exit(0); }
mkdirSync("screens/latest", { recursive: true });
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  await p.goto(pathToFileURL(page).href, { waitUntil: "networkidle" });
  await p.screenshot({ path: `screens/latest/${w}.png`, fullPage: true });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) console.log(`shots: HORIZONTAL OVERFLOW at ${w}px`);
  await p.close();
}
await browser.close();
console.log("shots: saved screens/latest/{1440,768,390}.png");
