// Screenshots dist pages at 3 widths into screens/latest/. Used by the Claude Code Stop hook and `npm run shots`.
// Home -> {1440,768,390}.png; other pages -> <name>-{width}.png. The 21+ page is shot past its gate, plus the gate itself.
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PAGES = [
  ["", "dist/index.html"],
  ["shows-", "dist/shows/index.html"],
  ["eat-", "dist/eat/index.html"],
  ["21-plus-", "dist/21-plus/index.html"],
];
if (!existsSync(PAGES[0][1])) { console.log("shots: no dist/index.html yet, skipping"); process.exit(0); }
mkdirSync("screens/latest", { recursive: true });
const browser = await chromium.launch();
const shoot = async (file, w, h, out, { gatePassed = true, fullPage = true } = {}) => {
  const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  if (gatePassed) await p.addInitScript(() => { try { localStorage.setItem("tv-21", "yes"); } catch {} });
  // "load" + fonts, not "networkidle": a streaming hero video never lets the network go idle.
  await p.goto(pathToFileURL(resolve(file)).href, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  // Walk down the page so lazy images load, then return to the top for the capture.
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    scrollTo(0, 0);
  });
  // Images in display:none containers (e.g. the story frame on phones) never load, so cap the wait.
  await p.evaluate(() => Promise.race([
    Promise.all([...document.images].filter((i) => !i.complete && i.offsetParent).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))),
    new Promise((r) => setTimeout(r, 4000)),
  ]));
  await p.waitForTimeout(400);
  await p.screenshot({ path: `screens/latest/${out}`, fullPage });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) console.log(`shots: HORIZONTAL OVERFLOW on ${file} at ${w}px`);
  await p.close();
};
for (const [prefix, file] of PAGES.filter(([, f]) => existsSync(f))) {
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) await shoot(file, w, h, `${prefix}${w}.png`);
}
const gated = PAGES.find(([prefix]) => prefix === "21-plus-")[1];
if (existsSync(gated)) await shoot(gated, 390, 844, "21-plus-gate-390.png", { gatePassed: false, fullPage: false });
await browser.close();
console.log("shots: saved screens/latest/{,shows-,eat-,21-plus-}{1440,768,390}.png + 21-plus-gate-390.png");
