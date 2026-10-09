// Builds dist/: renders src/*.html with listings from data/listings.json, copies css (tokens inlined), js and assets.
// Media slots use assets/media/<file> when it exists, otherwise a placeholder block.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "dist";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RAIL_STATUS = { open: 0, seasonal: 1, temp_closed: 2 }; // also the sort order
const MEDIA = "assets/media";

// "Plan my night" (PATTERNS #8): vibe and kid-friendliness come from category; budget from the sourced price.
const VIBES = {
  free: ["free", "family"], attractions: ["thrills", "family"], tours: ["thrills", "family"],
  shows: ["shows"], restaurants: ["food", "family"], nightclubs: ["nightlife"], "pool-party": ["nightlife"],
};
const ADULTS_ONLY = new Set(["nightclubs", "pool-party", "shows"]); // shows vary by age policy, so never pick them for kids

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "2026-10-08" -> "Oct 8" (year only when it isn't this year). Parsed by hand so time zones can't shift the day.
const shortDate = (iso, withYear = true) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}${!withYear || y === new Date().getFullYear() ? "" : `, ${y}`}`;
};
const sourced = (l) => l.sources?.length > 0; // never claim a price or "free" without a source

// "$" free or under $50, "$$" under $120, "$$$" above; "" when there's no sourced price to go on.
const budget = (l) => {
  if (l.free === true && sourced(l)) return "1";
  const n = l.price != null && sourced(l) ? Number(String(l.price).match(/\$(\d+(?:\.\d+)?)/)?.[1] ?? l.price) : NaN;
  if (!Number.isFinite(n)) return "";
  return n < 50 ? "1" : n < 120 ? "2" : "3";
};

const pill = (l) => {
  if (l.status === "seasonal") return `<p class="pill pill-seasonal">Seasonal</p>`;
  if (l.status === "temp_closed") return `<p class="pill pill-closed">${l.reopens ? `Reopens ${shortDate(l.reopens, false)}` : "Temporarily closed"}</p>`;
  return "";
};

// Prices are free text from the data lane ("From $68.36 ..."), shown as written; bare numbers get "from $X".
const card = (l, attrs = "") => {
  const price = l.price != null && sourced(l) ? `<p class="card-price">${typeof l.price === "number" ? `from $${l.price}` : esc(l.price)}</p>` : "";
  return `<li class="card"${attrs}>
        <div class="card-media ph" aria-hidden="true"></div>
        <div class="card-body">
          <h3 class="card-name">${esc(l.name)}</h3>
          ${l.venue ? `<p class="card-venue">${esc(l.venue)}</p>` : ""}
          ${price}
          ${pill(l)}
          <p class="card-checked">Verified <time datetime="${esc(l.last_checked)}">${shortDate(l.last_checked)}</time></p>
        </div>
      </li>`;
};

const data = JSON.parse(readFileSync("data/listings.json", "utf8"));
const live = data.listings.filter((l) => l.status !== "closed");
const onThisWeek = live
  .filter((l) => l.status in RAIL_STATUS && !l.adult) // 21+ listings never appear outside the gated pages
  .sort((a, b) => RAIL_STATUS[a.status] - RAIL_STATUS[b.status]);

// Every pickable listing is in the HTML; js/site.js shows up to 6 matches.
const planPool = live.filter((l) => (l.status === "open" || l.status === "seasonal") && !l.adult && VIBES[l.category]);
const planCard = (l) =>
  card(l, ` data-vibe="${VIBES[l.category].join(" ")}" data-budget="${budget(l)}" data-kids="${ADULTS_ONLY.has(l.category) ? "no" : "yes"}" hidden`);

// AI media gets an "Illustrative" caption (CLAUDE.md rule 5).
const has = (file) => existsSync(join(MEDIA, file));
const caption = `<span class="illus" aria-hidden="true">Illustrative</span>`;
const bandMedia = (file) =>
  has(file)
    ? `<img class="tile-media" src="${MEDIA}/${file}" alt="" loading="lazy" decoding="async">${caption}`
    : `<span class="tile-media ph" aria-hidden="true"></span>`;
const heroMedia = () => {
  if (!has("hero.mp4")) return `<div class="hero-media ph" aria-hidden="true"></div>`;
  const poster = has("hero-poster.jpg") ? ` poster="${MEDIA}/hero-poster.jpg"` : "";
  const mobile = has("hero-mobile.mp4") ? `<source src="${MEDIA}/hero-mobile.mp4" type="video/mp4" media="(max-width: 639px) and (orientation: portrait)">` : "";
  return `<video class="hero-media" autoplay muted loop playsinline preload="metadata"${poster} aria-hidden="true">${mobile}<source src="${MEDIA}/hero.mp4" type="video/mp4"></video>${caption}`;
};

const tokens = {
  onThisWeek: onThisWeek.map((l) => card(l)).join("\n      "),
  planPool: planPool.map(planCard).join("\n      "),
  heroMedia: heroMedia(),
  year: String(new Date().getFullYear()),
};
// {{band:shows}} -> assets/media/band-shows.jpg or its placeholder
const fill = (k) => (k.startsWith("band:") ? bandMedia(`band-${k.slice(5)}.jpg`) : tokens[k]);

// Replaces @import "x.css"; with the file's contents so the browser fetches one stylesheet.
const inlineCss = (file) =>
  readFileSync(file, "utf8").replace(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g, (_, p) => inlineCss(join(dirname(file), p)));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "css"), { recursive: true });

for (const f of readdirSync("src").filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join("src", f), "utf8").replace(/\{\{([\w:-]+)\}\}/g, (_, k) => {
    const v = fill(k);
    if (v == null) throw new Error(`build: unknown token {{${k}}} in src/${f}`);
    return v;
  });
  writeFileSync(join(OUT, f), html);
}
for (const f of readdirSync("css").filter((f) => f.endsWith(".css"))) writeFileSync(join(OUT, "css", f), inlineCss(join("css", f)));
cpSync("js", join(OUT, "js"), { recursive: true });
if (existsSync("assets")) cpSync("assets", join(OUT, "assets"), { recursive: true });

console.log(`build: ${live.length} live listings (${data.listings.length - live.length} closed skipped), ${onThisWeek.length} on this week, ${planPool.length} in plan my night -> ${OUT}/`);
