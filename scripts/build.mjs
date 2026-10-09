// Builds dist/: renders src/*.html with listings from data/listings.json, copies css (tokens inlined), js and assets.
// Media slots use assets/media/<file> when it exists, otherwise a placeholder block.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "dist";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RAIL_STATUS = new Set(["open", "seasonal", "temp_closed"]);
const RAIL_MAX = 10;
const RAIL_PER_CATEGORY = 2;
const RAIL_SKIP = new Set(["transportation"]); // useful facts, not things to do this week
const SITE = "https://travelovegas.com/";
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
const unconfirmed = (l) => /unconfirmed/i.test(l.notes ?? "");

// Whole days from today to an ISO date, counted on calendar dates so time zones can't shift it.
const now = new Date();
const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const daysUntil = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return (Date.UTC(y, m - 1, d) - today) / 864e5;
};
const soon = (iso) => typeof iso === "string" && daysUntil(iso) >= 0 && daysUntil(iso) <= 30;

// "$" free or under $50, "$$" under $120, "$$$" above; "" when there's no sourced price to go on.
const budget = (l) => {
  if (l.free === true && sourced(l)) return "1";
  const n = l.price != null && sourced(l) ? Number(String(l.price).match(/\$(\d+(?:\.\d+)?)/)?.[1] ?? l.price) : NaN;
  if (!Number.isFinite(n)) return "";
  return n < 50 ? "1" : n < 120 ? "2" : "3";
};

const pill = (l) => {
  if (unconfirmed(l)) return `<p class="pill pill-muted">Not yet confirmed</p>`; // category pages only; never in the rail or planner
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
// Closed listings and listings with no source at all never render anywhere.
const live = data.listings.filter((l) => l.status !== "closed" && sourced(l));
// The rail and planner also skip unconfirmed and 21+ listings.
const pickable = live.filter((l) => !unconfirmed(l) && !l.adult);

// "On this week": max 10. First anything with an event or reopening in the next 30 days, then featured,
// then a spread across categories (max 2 each) in data order.
const onThisWeek = (() => {
  const pool = pickable.filter((l) => RAIL_STATUS.has(l.status) && !RAIL_SKIP.has(l.category));
  const dated = pool
    .filter((l) => soon(l.event_date) || soon(l.reopens))
    .sort((a, b) => Math.min(...[a.event_date, a.reopens].filter(soon).map(daysUntil)) - Math.min(...[b.event_date, b.reopens].filter(soon).map(daysUntil)));
  const picked = [...new Set([...dated, ...pool.filter((l) => l.featured === true)])].slice(0, RAIL_MAX);
  const perCategory = (c) => picked.filter((l) => l.category === c).length;
  const byCategory = Map.groupBy(pool.filter((l) => !picked.includes(l)), (l) => l.category);
  for (let round = 0; picked.length < RAIL_MAX && round < RAIL_PER_CATEGORY; round++) {
    for (const [c, ls] of byCategory) {
      if (picked.length >= RAIL_MAX) break;
      const next = ls.find((l) => !picked.includes(l));
      if (next && perCategory(c) < RAIL_PER_CATEGORY) picked.push(next);
    }
  }
  return picked;
})();

// Every pickable listing is in the HTML; js/site.js shows up to 6 matches.
const planPool = pickable.filter((l) => (l.status === "open" || l.status === "seasonal") && VIBES[l.category]);
const planCard = (l) =>
  card(l, ` data-vibe="${VIBES[l.category].join(" ")}" data-budget="${budget(l)}" data-kids="${ADULTS_ONLY.has(l.category) ? "no" : "yes"}" hidden`);

// FAQ (PATTERNS #11): one source for the <details> and the FAQPage JSON-LD.
const { faq } = JSON.parse(readFileSync("src/faq.json", "utf8"));
const ids = new Set(data.listings.map((l) => l.id));
for (const f of faq) {
  const missing = f.from.filter((id) => !ids.has(id));
  if (missing.length) throw new Error(`build: FAQ "${f.q}" cites missing listings: ${missing.join(", ")}`);
  if (/\u2014/.test(f.q + f.a)) throw new Error(`build: em dash in FAQ "${f.q}"`);
}
const faqHtml = faq
  .map((f) => `<details class="faq-item">
          <summary><h3 class="faq-q">${esc(f.q)}</h3><span class="faq-icon" aria-hidden="true"></span></summary>
          <div class="faq-a">
            <p>${esc(f.a)}</p>
            <p><a class="faq-link" href="${f.link[0]}">${esc(f.link[1])}</a></p>
          </div>
        </details>`)
  .join("\n        ");

// JSON-LD is escaped so a "</script>" inside text can't end the block.
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const structuredData = [
  jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: `${f.a} <a href="${SITE}${f.link[0]}">${f.link[1]}</a>` },
    })),
  }),
  jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "On this week in Las Vegas",
    numberOfItems: onThisWeek.length,
    itemListElement: onThisWeek.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Place", name: l.name, ...(l.venue && { address: `${l.venue}, Las Vegas, NV` }) },
    })),
  }),
].join("\n  ");

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
  faq: faqHtml,
  structuredData,
  ogImage: has("og-image.jpg")
    ? `<meta property="og:image" content="${SITE}${MEDIA}/og-image.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:card" content="summary_large_image">`
    : `<meta name="twitter:card" content="summary">`,
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

console.log(`build: ${live.length} live listings (${data.listings.length - live.length} closed or unsourced skipped), ${onThisWeek.length} on this week, ${planPool.length} in plan my night -> ${OUT}/`);
