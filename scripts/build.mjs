// Builds dist/ from src/ + data/listings.json: home, one page per category, 404, sitemap, robots.
// Copies css (tokens inlined), js and assets, then fails the build on any broken internal link.
// Media slots use assets/media/<file> when it exists, otherwise a placeholder block.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";

const OUT = "dist";
const SITE = "https://travelovegas.com/";
const MEDIA = "assets/media";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const read = (f) => readFileSync(f, "utf8");
const readJson = (f) => JSON.parse(read(f));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---------- Listing rules (CLAUDE.md 2, 3, 9) ----------
const data = readJson("data/listings.json");
const affiliates = readJson("config/affiliates.json");
const sourced = (l) => l.sources?.length > 0;
const unconfirmed = (l) => l.status === "likely_open" || /unconfirmed/i.test(l.notes ?? "");
const confirmed = (l) => !unconfirmed(l);
// Closed, unsourced and "Do not list" listings never render anywhere.
const live = data.listings.filter((l) => l.status !== "closed" && sourced(l) && !/do not list/i.test(l.notes ?? ""));
// The home rail and planner only use confirmed, non-21+ listings.
const pickable = live.filter((l) => confirmed(l) && !l.adult);

// ---------- Dates ----------
const now = new Date();
const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const parse = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, t: Date.UTC(y, m - 1, d) };
};
const daysUntil = (iso) => (parse(iso).t - today) / 864e5;
// "2026-10-08" -> "Oct 8" (year only when it isn't this year). Parsed by hand so time zones can't shift the day.
const shortDate = (iso, withYear = true) => {
  const { y, m, d } = parse(iso);
  return `${MONTHS[m - 1]} ${d}${!withYear || y === now.getFullYear() ? "" : `, ${y}`}`;
};
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
// Days until the listing's next dated moment in the next 30 days (an event running or a reopening), else null.
const nextDated = (l) => {
  const hits = [];
  if (isDate(l.event_date) && daysUntil(l.event_date) <= 30 && daysUntil(isDate(l.event_end) ? l.event_end : l.event_date) >= 0) {
    hits.push(Math.max(0, daysUntil(l.event_date)));
  }
  if (isDate(l.reopens) && daysUntil(l.reopens) >= 0 && daysUntil(l.reopens) <= 30) hits.push(daysUntil(l.reopens));
  return hits.length ? Math.min(...hits) : null;
};

// ---------- Cards (text-first; an image frame only when the listing has "image") ----------
const LABELS = {
  shows: "Show", free: "Free", attractions: "Attraction", tours: "Tour", restaurants: "Restaurant",
  nightclubs: "Nightclub", "pool-party": "Pool party", transportation: "Getting around",
  "strip-clubs": "Strip club", "adult-shows": "Adult show", dispensaries: "Dispensary",
};
const CUISINE = (c) => (c === "bbq" ? "BBQ" : c.replace(/-/g, " ").replace(/^\w/, (x) => x.toUpperCase()));
const label = (l) => (l.category === "restaurants" && l.cuisine?.length ? CUISINE([].concat(l.cuisine)[0]) : LABELS[l.category] ?? "");

const pill = (l) => {
  if (unconfirmed(l)) return `<span class="pill pill-muted">Not yet confirmed</span>`;
  if (l.status === "seasonal") return `<span class="pill pill-seasonal">Seasonal</span>`;
  if (l.status === "temp_closed") return `<span class="pill pill-closed">${isDate(l.reopens) ? `Reopens ${shortDate(l.reopens, false)}` : "Temporarily closed"}</span>`;
  return "";
};

// booking_url + the affiliate query for its host from config/affiliates.json (empty until accounts exist). Never on 21+.
const bookingUrl = (l) => {
  if (l.adult || !l.booking_url) return null;
  const url = new URL(l.booking_url);
  const host = Object.keys(affiliates).find((h) => !h.startsWith("_") && url.hostname.endsWith(h));
  if (host && affiliates[host]) for (const [k, v] of new URLSearchParams(affiliates[host])) url.searchParams.set(k, v);
  return url.href;
};

const cardImage = (l, root) => {
  if (!l.image || l.adult) return "";
  const src = /^(https?:)?\//.test(l.image) ? l.image : `${root}${MEDIA}/${l.image}`;
  // Flow (AI) media is the default; a real photo carries image_credit instead of the Illustrative caption.
  const note = l.image_credit ? `<span class="illus">${esc(l.image_credit)}</span>` : `<span class="illus" aria-hidden="true">Illustrative</span>`;
  return `<div class="card-media"><img src="${esc(src)}" alt="" loading="lazy" decoding="async">${note}</div>`;
};

const card = (l, { root = "", attrs = "" } = {}) => {
  const book = bookingUrl(l);
  return `<li class="card"${attrs}>
        ${cardImage(l, root)}<div class="card-body">
          <p class="card-top"><span class="card-cat">${esc(label(l))}</span>${pill(l)}</p>
          <h3 class="card-name">${esc(l.name)}</h3>
          ${l.venue ? `<p class="card-venue">${esc(l.venue)}</p>` : ""}
          ${l.alert ? `<p class="card-alert">${esc(l.alert)}</p>` : ""}
          ${l.price != null ? `<p class="card-price">${esc(l.price)}</p>` : ""}
          <p class="card-checked">Verified <time datetime="${esc(l.last_checked)}">${shortDate(l.last_checked)}</time></p>
          ${book ? `<a class="btn btn-neon card-book" href="${esc(book)}" target="_blank" rel="sponsored noopener">Check tickets</a>` : ""}
        </div>
      </li>`;
};
// Rule 4: a disclosure line next to any block that holds an affiliate link.
const disclosure = (ls, root) =>
  ls.some(bookingUrl) ? `<p class="disclosure">We may earn a commission if you book through these links, at no extra cost to you. <a href="${root}#disclosure">How we're paid</a></p>` : "";

// ---------- Home: "On this week" rail ----------
const RAIL_MAX = 10;
const RAIL_PER_CATEGORY = 2;
const RAIL_SKIP = new Set(["transportation"]); // useful facts, not things to do this week
// Max 10: anything with an event or reopening in the next 30 days, then featured, then max 2 per category in data order.
const onThisWeek = (() => {
  const pool = pickable.filter((l) => ["open", "seasonal", "temp_closed"].includes(l.status) && !RAIL_SKIP.has(l.category));
  const dated = pool.filter((l) => nextDated(l) != null).sort((a, b) => nextDated(a) - nextDated(b));
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

// ---------- Home: "Plan my night" pool (PATTERNS #8) ----------
const PLAN_PER_CATEGORY = 8;
const VIBES = {
  attractions: ["thrills"], tours: ["thrills"], shows: ["shows"], restaurants: ["food"],
  nightclubs: ["nightlife"], "pool-party": ["nightlife"], free: [],
};
const has = (l, tag) => l.tags?.includes(tag);
const priceNumber = (l) => Number(String(l.price ?? "").match(/\$(\d+(?:\.\d+)?)/)?.[1] ?? NaN);
const budgets = (l) => [
  ...(l.free === true || has(l, "budget") || priceNumber(l) < 50 ? ["cheap"] : []),
  ...(has(l, "splurge") || priceNumber(l) >= 120 ? ["splurge"] : []),
];
// "free" only for free === true (listings here are all sourced); "family" only from the tag.
const vibes = (l) => [...VIBES[l.category], ...(l.free === true ? ["free"] : []), ...(has(l, "family") ? ["family"] : [])];
const planPool = [...Map.groupBy(pickable.filter((l) => ["open", "seasonal"].includes(l.status) && l.category in VIBES), (l) => l.category).values()]
  .flatMap((ls) => ls.filter((l) => vibes(l).length).slice(0, PLAN_PER_CATEGORY));
const planCard = (l) =>
  card(l, { attrs: ` data-vibe="${vibes(l).join(" ")}" data-budget="${budgets(l).join(" ")}" data-tags="${(l.tags ?? []).join(" ")}" hidden` });

// ---------- FAQ (PATTERNS #11): one source for the <details> and the FAQPage JSON-LD ----------
const { faq } = readJson("src/faq.json");
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

// ---------- Structured data ----------
// Escaped so a "</script>" inside text can't end the block.
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...obj }).replace(/</g, "\\u003c")}</script>`;
const itemList = (name, ls) => jsonLd({
  "@type": "ItemList",
  name,
  numberOfItems: ls.length,
  itemListElement: ls.map((l, i) => ({
    "@type": "ListItem",
    position: i + 1,
    // Address only when the listing has its own sourced "address" (venue names aren't addresses).
    item: { "@type": "Place", name: l.name, ...(l.address && sourced(l) && { address: l.address }) },
  })),
});
const breadcrumbs = (page) => jsonLd({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: page.crumb, item: `${SITE}${page.slug}/` },
  ],
});
const faqLd = jsonLd({
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: `${f.a} <a href="${SITE}${f.link[0]}">${f.link[1]}</a>` },
  })),
});

// ---------- Media ----------
const exists = (file) => existsSync(join(MEDIA, file));
const caption = `<span class="illus" aria-hidden="true">Illustrative</span>`; // AI media (CLAUDE.md rule 5)
const bandMedia = (file, root, cls = "tile-media") =>
  exists(file)
    ? `<img class="${cls}" src="${root}${MEDIA}/${file}" alt="" loading="lazy" decoding="async">${caption}`
    : `<span class="${cls} ph" aria-hidden="true"></span>`;
const heroMedia = (root) => {
  if (!exists("hero.mp4")) return `<div class="hero-media ph" aria-hidden="true"></div>`;
  const poster = exists("hero-poster.jpg") ? ` poster="${root}${MEDIA}/hero-poster.jpg"` : "";
  const mobile = exists("hero-mobile.mp4") ? `<source src="${root}${MEDIA}/hero-mobile.mp4" type="video/mp4" media="(max-width: 639px) and (orientation: portrait)">` : "";
  return `<video class="hero-media" autoplay muted loop playsinline preload="metadata"${poster} aria-hidden="true">${mobile}<source src="${root}${MEDIA}/hero.mp4" type="video/mp4"></video>${caption}`;
};
const ogImage = exists("og-image.jpg")
  ? `<meta property="og:image" content="${SITE}${MEDIA}/og-image.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:card" content="summary_large_image">`
  : `<meta name="twitter:card" content="summary">`;

// ---------- Templates ----------
const PARTIALS = ["head", "header", "footer"];
// {{key}} from vars; {{band:x}} is a home tile image. Partials see the same vars. Unknown keys fail the build.
const render = (tpl, vars, root) => {
  const all = { root, home: root || "./", year: String(now.getFullYear()), ogImage, robots: "index, follow", ...vars };
  const fill = (s) => s.replace(/\{\{([\w:-]+)\}\}/g, (_, k) => {
    if (k.startsWith("band:")) return bandMedia(`band-${k.slice(5)}.jpg`, root);
    if (PARTIALS.includes(k)) return fill(read(`src/partials/${k}.html`));
    if (all[k] == null) throw new Error(`build: unknown token {{${k}}}`);
    return all[k];
  });
  return fill(tpl);
};

// ---------- Category pages ----------
const { pages } = readJson("src/pages.json");
const TAGS = { "date-night": "Date night", family: "Family", group: "Groups", budget: "Budget", splurge: "Splurge", vegetarian: "Vegetarian" };
const VEG = ["vegetarian", "vegan", "vegetarian-friendly"];
const PAGE_FILTERS = {
  // Free means free === true with a source, from any category except 21+.
  free: (l) => l.free === true && !l.adult,
  // Attractions have no page of their own, so they live with tours (plus free-category spots not confirmed free).
  tours: (l) => ["tours", "attractions"].includes(l.category) || (l.category === "free" && l.free !== true),
};
const filterKeys = (page, l) =>
  page.slug === "eat"
    ? [...new Set([...[].concat(l.cuisine ?? []).map((c) => (VEG.includes(c) ? "vegetarian" : c)), ...(has(l, "vegetarian") ? ["vegetarian"] : [])])]
    : l.tags ?? [];
// Eat filters by cuisine (Indian and Vegetarian first, then by count); every other page by tags. 2+ listings per chip.
const filtersFor = (page, ls) => {
  const count = (v) => ls.filter((l) => filterKeys(page, l).includes(v)).length;
  const options = page.slug === "eat"
    ? [["indian", "Indian"], ["vegetarian", "Vegetarian"],
      ...[...new Set(ls.flatMap((l) => filterKeys(page, l)))].filter((c) => c !== "indian" && c !== "vegetarian").sort((a, b) => count(b) - count(a)).map((c) => [c, CUISINE(c)])]
    : Object.entries(TAGS);
  return options.filter(([v]) => count(v) >= 2);
};

const renderPage = (page, root) => {
  const inPage = PAGE_FILTERS[page.slug] ?? ((l) => page.categories.includes(l.category));
  // Confirmed first, then "Not yet confirmed"; data order within each.
  const ls = live.filter(inPage).sort((a, b) => confirmed(b) - confirmed(a));
  const chips = page.slug === "21-plus" ? [] : filtersFor(page, ls);
  const n = ls.filter(confirmed).length;
  const html = render(read("src/templates/category.html"), {
    title: page.title,
    description: page.description.replace("{n}", n),
    canonical: `${SITE}${page.slug}/`,
    ogTitle: page.h1,
    structuredData: [breadcrumbs(page), itemList(page.h1, ls)].join("\n  "),
    h1: esc(page.h1),
    crumb: esc(page.crumb),
    answer: esc(page.answer.replace("{n}", n)),
    bandMedia: bandMedia(`band-${page.band}.jpg`, root, "cat-media"),
    chips: chips.length < 2 ? "" : `<div class="chips filter-chips" role="group" aria-label="Filter ${esc(page.crumb.toLowerCase())}">
          <button class="chip" type="button" aria-pressed="true" value="">All</button>
          ${chips.map(([v, t]) => `<button class="chip" type="button" aria-pressed="false" value="${esc(v)}">${esc(t)}</button>`).join("\n          ")}
        </div>`,
    count: `${ls.length} ${ls.length === 1 ? "place" : "places"}`,
    disclosure: disclosure(ls, root),
    cards: ls.map((l) => card(l, { root, attrs: ` data-filter="${esc(filterKeys(page, l).join(" "))}"` })).join("\n      "),
    extra: page.slug === "21-plus" ? render(read("src/partials/21-plus-extra.html"), {}, root) : "",
    gate: page.slug === "21-plus" ? render(read("src/partials/gate.html"), {}, root) : "",
  }, root);
  return { html, count: ls.length };
};

// ---------- Write ----------
const inlineCss = (file) =>
  read(file).replace(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g, (_, p) => inlineCss(join(dirname(file), p)));
const write = (path, content) => {
  mkdirSync(dirname(join(OUT, path)), { recursive: true });
  writeFileSync(join(OUT, path), content);
};

rmSync(OUT, { recursive: true, force: true });

write("index.html", render(read("src/index.html"), {
  title: "Things to Do in Las Vegas, Checked Weekly | TraveloVegas",
  description: "Shows, free things on the Strip, pool parties, food, nightlife and getting around in Las Vegas. Checked by locals and updated every week.",
  canonical: SITE,
  ogTitle: "The Strip, without the guesswork",
  structuredData: [faqLd, itemList("On this week in Las Vegas", onThisWeek)].join("\n  "),
  heroMedia: heroMedia(""),
  onThisWeek: onThisWeek.map((l) => card(l)).join("\n      "),
  weekDisclosure: disclosure(onThisWeek, ""),
  planPool: planPool.map(planCard).join("\n      "),
  faq: faqHtml,
}, ""));

const built = [];
for (const page of pages) {
  const { html, count } = renderPage(page, "../");
  write(`${page.slug}/index.html`, html);
  built.push(`${page.slug} ${count}`);
}

write("404.html", render(read("src/404.html"), {
  title: "Page not found | TraveloVegas",
  description: "That page isn't here. Head back to the TraveloVegas home page.",
  canonical: SITE,
  ogTitle: "Page not found",
  structuredData: "",
  robots: "noindex",
}, "/"));

write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", ...pages.map((p) => `${p.slug}/`)].map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${data.last_full_check}</lastmod></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

for (const f of readdirSync("css").filter((f) => f.endsWith(".css"))) write(`css/${f}`, inlineCss(join("css", f)));
cpSync("js", join(OUT, "js"), { recursive: true });
if (existsSync("assets")) cpSync("assets", join(OUT, "assets"), { recursive: true });

// ---------- Link check: every internal href must resolve to a built file and #id ----------
const htmlFiles = ["index.html", ...pages.map((p) => `${p.slug}/index.html`)]; // 404 uses root-absolute links
const idsIn = Object.fromEntries(htmlFiles.map((f) => [f, new Set([...read(join(OUT, f)).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const broken = [];
for (const f of htmlFiles) {
  for (const [, href] of read(join(OUT, f)).matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [path, hash] = href.split("#");
    let target = path ? posix.normalize(posix.join(posix.dirname(f), path)) : f;
    if (path.endsWith("/") || target === ".") target = posix.join(target, "index.html");
    if (!existsSync(join(OUT, target))) broken.push(`${f}: ${href}`);
    else if (hash && target.endsWith(".html") && !idsIn[target]?.has(hash)) broken.push(`${f}: ${href} (no #${hash})`);
  }
}
if (broken.length) throw new Error(`build: broken links\n  ${broken.join("\n  ")}`);

console.log(`build: ${live.length} live listings (${data.listings.length - live.length} closed, unsourced or hidden), ${onThisWeek.length} on this week, ${planPool.length} in plan my night`);
console.log(`build: pages ${built.join(", ")}; links OK -> ${OUT}/`);
