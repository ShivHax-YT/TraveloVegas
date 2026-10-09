// Screenshots dist pages at 3 widths into screens/latest/. Used by the Claude Code Stop hook and `npm run shots`.
// Home -> {1440,768,390}.png; other pages -> <name>-{width}.png. The 21+ page is shot past its gate, plus the gate itself.
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PAGES = [
  ["", "dist/index.html"],
  ["eat-", "dist/eat/index.html"],
  ["21-plus-", "dist/21-plus/index.html"],
];
if (!existsSync(PAGES[0][1])) { console.log("shots: no dist/index.html yet, skipping"); process.exit(0); }
mkdirSync("screens/latest", { recursive: true });
const browser = await chromium.launch();
const shoot = async (file, w, h, out, { gatePassed = true, fullPage = true } = {}) => {
  const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  if (gatePassed) await p.addInitScript(() => { try { localStorage.setItem("tv-21", "yes"); } catch {} });
  await p.goto(pathToFileURL(resolve(file)).href, { waitUntil: "networkidle" });
  await p.screenshot({ path: `screens/latest/${out}`, fullPage });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) console.log(`shots: HORIZONTAL OVERFLOW on ${file} at ${w}px`);
  await p.close();
};
for (const [prefix, file] of PAGES.filter(([, f]) => existsSync(f))) {
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) await shoot(file, w, h, `${prefix}${w}.png`);
}
if (existsSync(PAGES[2][1])) await shoot(PAGES[2][1], 390, 844, "21-plus-gate-390.png", { gatePassed: false, fullPage: false });
await browser.close();
console.log("shots: saved screens/latest/{,eat-,21-plus-}{1440,768,390}.png + 21-plus-gate-390.png");
