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
const mediaInfo = readJson("config/media.json");
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
// An event is upcoming while its last day (event_end, else event_date) hasn't passed.
const eventEnd = (l) => (isDate(l.event_end) ? l.event_end : l.event_date);
const upcomingEvent = (l) => isDate(l.event_date) && daysUntil(eventEnd(l)) >= 0;
// "Oct 17" or "Nov 19 to 22" / "Oct 30 to Nov 2"
const eventDates = (l) => {
  if (!isDate(l.event_end) || l.event_end === l.event_date) return shortDate(l.event_date);
  const [a, b] = [parse(l.event_date), parse(l.event_end)];
  return `${shortDate(l.event_date)} to ${a.m === b.m && a.y === b.y ? b.d : shortDate(l.event_end)}`;
};
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
  nightclubs: "Nightclub", "pool-party": "Pool party", transportation: "Getting around", events: "Event",
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
  const local = !/^(https?:)?\//.test(l.image);
  const src = local ? `${root}${MEDIA}/${l.image}` : l.image;
  // Local files follow config/media.json; remote images carry their own image_credit.
  const note = local ? captionFor(l.image) : l.image_credit ? `<span class="illus">${esc(l.image_credit)}</span>` : "";
  return `<div class="card-media"><img src="${esc(src)}" alt="" loading="lazy" decoding="async">${note}</div>`;
};

// Button text by booking type; the disclosure line stays next to every block of these.
const bookLabel = (l) =>
  /(^|\.)opentable\.com$/.test(new URL(l.booking_url).hostname) ? "Reserve a table"
    : l.category === "tours" ? "Book a tour"
    : l.category === "events" || upcomingEvent(l) ? "Get tickets"
    : "Check tickets";

const ages = (l) => (typeof l.min_age !== "number" ? "" : l.min_age > 0 ? `Ages ${l.min_age}+` : "All ages");

const card = (l, { root = "", attrs = "", level = 3 } = {}) => {
  const book = bookingUrl(l);
  return `<li class="card"${attrs}>
        ${cardImage(l, root)}<div class="card-body">
          <p class="card-top"><span class="card-cat">${esc(label(l))}</span>${pill(l)}</p>
          <h${level} class="card-name">${esc(l.name)}</h${level}>
          ${upcomingEvent(l) ? `<p class="card-when"><time datetime="${esc(l.event_date)}">${eventDates(l)}</time></p>` : ""}
          ${l.venue ? `<p class="card-venue">${esc(l.venue)}</p>` : ""}
          ${l.alert ? `<p class="card-alert">${esc(l.alert)}</p>` : ""}
          ${l.price != null ? `<p class="card-price">${esc(l.price)}</p>` : ""}
          ${ages(l) ? `<p class="card-ages">${ages(l)}</p>` : ""}
          <p class="card-checked">Last checked <time datetime="${esc(l.last_checked)}">${shortDate(l.last_checked)}</time></p>
          ${book ? `<a class="btn btn-neon card-book" href="${esc(book)}" target="_blank" rel="sponsored noopener">${bookLabel(l)}</a>` : ""}
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
const PLAN_RESTAURANTS = 24;
const SPREAD_TAGS = ["date-night", "family", "budget", "splurge", "vegetarian"];
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
// Restaurants: up to 24, taking turns across the tags so every Who/Budget pick has options. Others: first 8.
const spread = (ls, max) => {
  const out = [];
  for (let added = true; added && out.length < max;) {
    added = false;
    for (const t of SPREAD_TAGS) {
      const next = ls.find((l) => has(l, t) && !out.includes(l));
      if (next && out.length < max) { out.push(next); added = true; }
    }
  }
  return out;
};
const planPool = [...Map.groupBy(pickable.filter((l) => ["open", "seasonal"].includes(l.status) && l.category in VIBES), (l) => l.category)]
  .flatMap(([c, ls]) => {
    const ok = ls.filter((l) => vibes(l).length);
    return c === "restaurants" ? spread(ok, PLAN_RESTAURANTS) : ok.slice(0, PLAN_PER_CATEGORY);
  });
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
    item: upcomingEvent(l)
      ? { "@type": "Event", name: l.name, startDate: l.event_date, endDate: eventEnd(l), location: { "@type": "Place", name: l.venue ?? "Las Vegas", ...(l.address && { address: l.address }) } }
      : { "@type": "Place", name: l.name, ...(l.address && sourced(l) && { address: l.address }) },
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

// ---------- Strip map (PATTERNS #9): hand-built SVG, pins for featured listings ----------
const strip = readJson("src/strip.json");
const stripMap = (() => {
  const W = 460, ROW = 32, TOP = 84;
  const X = { line: 190, wDot: 176, wLabel: 162, eDot: 204, eLabel: 218, rail: 372, railLabel: 384 };
  const SHORT = { "Wynn and Encore": "Wynn / Encore", "The Venetian and Palazzo": "Venetian / Palazzo", "The LINQ and Harrah's": "LINQ / Harrah's", "Welcome to Fabulous Las Vegas sign": "Welcome sign" };
  const y = (i) => TOP + i * ROW;
  const H = y(strip.resorts.length - 1) + 56;
  const spots = [strip.downtown, ...strip.resorts];
  // A listing's own "map" (resort id) wins. Otherwise an exact name match, then the match that starts
  // earliest in the venue, then the longest ("Sphere (by The Venetian)" is Sphere, not The Venetian).
  const spotFor = (l) => {
    if (l.map) return spots.find((r) => r.id === l.map);
    const venue = l.venue ?? "";
    let best = null;
    for (const r of spots) {
      if (r.name.toLowerCase() === venue.toLowerCase()) return r;
      for (const m of r.match) {
        const hit = new RegExp(m).exec(venue);
        if (hit && (!best || hit.index < best.at || (hit.index === best.at && hit[0].length > best.len))) best = { r, at: hit.index, len: hit[0].length };
      }
    }
    return best?.r;
  };
  const pins = Map.groupBy(pickable.filter((l) => l.featured === true && spotFor(l)), (l) => spotFor(l).id);
  const pin = (id, cx, cy, name) => {
    const ls = pins.get(id);
    if (!ls) return "";
    return `<g class="pin" data-pin="${id}" tabindex="0" role="button" aria-controls="map-cards" aria-label="${esc(`${name}: ${ls.map((l) => l.name).join(", ")}`)}">
          <circle class="pin-halo" cx="${cx}" cy="${cy}" r="15"/><circle class="pin-dot" cx="${cx}" cy="${cy}" r="8"/>
        </g>`;
  };
  const rows = strip.resorts.map((r, i) => {
    const cy = y(i);
    const [dot, lx, anchor] = r.side === "w" ? [X.wDot, X.wLabel, "end"] : r.side === "e" ? [X.eDot, X.eLabel, "start"] : [X.line, X.eLabel, "start"];
    return `<g class="spot${r.side === "c" ? " spot-c" : ""}"><circle cx="${dot}" cy="${cy}" r="4.5"/><text x="${lx}" y="${cy + 5}" text-anchor="${anchor}">${esc(SHORT[r.name] ?? r.name)}</text></g>
        ${pin(r.id, dot, cy, r.name)}`;
  });
  const at = Object.fromEntries(strip.resorts.map((r, i) => [r.id, y(i)]));
  const stations = strip.monorail.map((s) => `<g class="station"><circle cx="${X.rail}" cy="${at[s.at]}" r="5"/><text x="${X.railLabel}" y="${at[s.at] + 4}">${esc(s.name.split("/")[0])}</text></g>`);
  const railTop = at[strip.monorail[0].at], railBottom = at[strip.monorail.at(-1).at];
  const svg = `<svg class="strip-svg" viewBox="0 0 ${W} ${H}" role="group" aria-labelledby="map-title map-desc">
        <desc id="map-desc">Schematic map of the Las Vegas Strip from The STRAT in the north to the Welcome sign in the south, with resorts on each side of Las Vegas Boulevard, the 7 Monorail stations on the east side and pins for our featured picks. Not to scale.</desc>
        <path class="strip-line" d="M${X.line} 30 V${H - 24}"/>
        <path class="strip-arrow" d="M${X.line - 7} 40 L${X.line} 28 L${X.line + 7} 40"/>
        <text class="strip-north" x="${X.eLabel}" y="38">Downtown and Fremont St</text>
        ${pin("downtown", X.line, 30, strip.downtown.name)}
        <path class="rail-line" d="M${X.rail} ${railTop} V${railBottom}"/>
        <text class="rail-title" x="${X.rail}" y="${railTop - 18}" text-anchor="middle">Monorail</text>
        ${stations.join("\n        ")}
        ${rows.join("\n        ")}
      </svg>`;
  const cards = [...pins].flatMap(([id, ls]) => ls.map((l) => card(l, { attrs: ` data-pin="${id}"` })));
  return { svg, cards: cards.join("\n      "), count: [...pins.values()].flat().length };
})();

// ---------- Media (config/media.json decides the AI caption and the footer credits) ----------
const exists = (file) => existsSync(join(MEDIA, file));
// Files shown on the page being built; cleared before each page so its footer credits only that page's media.
const used = new Set();
const info = (file, { shown = true } = {}) => {
  if (!mediaInfo[file]) throw new Error(`build: ${MEDIA}/${file} is not in config/media.json (ai + credit)`);
  if (shown) used.add(file);
  return mediaInfo[file];
};
const captionFor = (file) => (info(file).ai ? `<span class="illus" aria-hidden="true">Illustrative</span>` : ""); // CLAUDE.md rule 5
const bandMedia = (file, root, cls = "tile-media") =>
  exists(file)
    ? `<img class="${cls}" src="${root}${MEDIA}/${file}" alt="" loading="lazy" decoding="async">${captionFor(file)}`
    : `<span class="${cls} ph" aria-hidden="true"></span>`;
// <base>.mp4 (+ <base>-mobile.mp4, <base>-poster.jpg) as a muted loop with a pause button (WCAG 2.2.2).
// js/site.js keeps it paused under reduced motion. Null when <base>.mp4 isn't there.
const videoMedia = (base, root, cls) => {
  if (!exists(`${base}.mp4`)) return null;
  const src = (f) => `${root}${MEDIA}/${f}`;
  const poster = exists(`${base}-poster.jpg`) && info(`${base}-poster.jpg`) ? ` poster="${src(`${base}-poster.jpg`)}"` : "";
  const mobile = exists(`${base}-mobile.mp4`) && info(`${base}-mobile.mp4`)
    ? `<source src="${src(`${base}-mobile.mp4`)}" type="video/mp4" media="(max-width: 639px) and (orientation: portrait)">` : "";
  return `<video class="${cls}" autoplay muted loop playsinline preload="metadata"${poster} aria-hidden="true" data-video>${mobile}<source src="${src(`${base}.mp4`)}" type="video/mp4"></video>${captionFor(`${base}.mp4`)}
      <button class="video-toggle" type="button" aria-pressed="false" aria-label="Pause background video" data-video-toggle>
        <svg class="icon-pause" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>
        <svg class="icon-play" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>
      </button>`;
};
const heroMedia = (root) => videoMedia("hero", root, "hero-media") ?? `<div class="hero-media ph" aria-hidden="true"></div>`;
// Category heroes: cat-<band>.mp4 when present, else band-<band>.jpg, else a placeholder.
const catMedia = (band, root) => videoMedia(`cat-${band}`, root, "cat-media") ?? bandMedia(`band-${band}.jpg`, root, "cat-media");
const ogImage = exists("og-image.jpg") && info("og-image.jpg", { shown: false })
  ? `<meta property="og:image" content="${SITE}${MEDIA}/og-image.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:card" content="summary_large_image">`
  : `<meta name="twitter:card" content="summary">`;
// One footer line with the credit of every media file shown on this page, AI or not (og:image isn't shown).
const credits = () => {
  const names = [...new Set([...used].map((f) => mediaInfo[f].credit).filter(Boolean))];
  return names.length ? `<p class="footer-credits">${esc(names.join(". ").replace(/\.$/, ""))}.</p>` : "";
};

// ---------- Templates ----------
const PARTIALS = ["head", "header", "footer"];
// {{key}} from vars; {{band:x}} is a home tile image. Partials see the same vars. Unknown keys fail the build.
const render = (tpl, vars, root) => {
  const all = { root, home: root || "./", year: String(now.getFullYear()), ogImage, credits: credits(), robots: "index, follow", ...vars };
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
  // Events come from event_date/event_end on any non-21+ listing, soonest first.
  events: (l) => upcomingEvent(l) && !l.adult,
};
const PAGE_SORT = { events: (a, b) => parse(a.event_date).t - parse(b.event_date).t };
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

// /eat/: one group per cuisine (Indian, Vegetarian, then by size). Each card appears once, in its first match.
// Groups show 6 cards; js/site.js collapses the rest behind "Show all" (without JS everything stays visible).
const EAT_SHOWN = 6;
const eatGroups = (page, ls, root) => {
  const order = filtersFor(page, ls).map(([v, t]) => [v, t]);
  const placed = new Set();
  const groups = [...order, ["other", "More places"]].map(([v, t]) => {
    const members = ls.filter((l) => !placed.has(l) && (v === "other" || filterKeys(page, l).includes(v)));
    members.forEach((l) => placed.add(l));
    return { v, t, members };
  }).filter((g) => g.members.length);
  const jump = `<nav class="jump" aria-label="Cuisines">
          <ul role="list">${groups.map((g) => `<li><a href="#cuisine-${g.v}">${esc(g.t)}</a></li>`).join("")}</ul>
        </nav>`;
  const html = groups.map((g) => `<section class="cuisine" aria-labelledby="cuisine-${g.v}">
          <h3 class="cuisine-title" id="cuisine-${g.v}" tabindex="-1">${esc(g.t)} <span class="cuisine-count">${g.members.length}</span></h3>
          <ul class="cat-grid" id="cuisine-list-${g.v}" role="list">
      ${g.members.map((l, i) => card(l, { root, level: 4, attrs: i >= EAT_SHOWN ? " data-more" : "" })).join("\n      ")}
          </ul>
          ${g.members.length > EAT_SHOWN ? `<button class="btn btn-ghost show-all" type="button" aria-expanded="false" aria-controls="cuisine-list-${g.v}" hidden>Show all ${g.members.length}</button>` : ""}
        </section>`).join("\n        ");
  return { jump, html };
};

const renderPage = (page, root) => {
  used.clear();
  const inPage = PAGE_FILTERS[page.slug] ?? ((l) => page.categories.includes(l.category));
  // Confirmed first, then "Not yet confirmed"; data order within each (events: soonest first).
  const ls = live.filter(inPage).sort(PAGE_SORT[page.slug] ?? ((a, b) => confirmed(b) - confirmed(a)));
  const grouped = page.slug === "eat" ? eatGroups(page, ls, root) : null;
  const chips = page.slug === "21-plus" || grouped ? [] : filtersFor(page, ls);
  const n = ls.filter(confirmed).length;
  const [one, many] = page.noun ?? ["place", "places"];
  const gated = page.slug === "21-plus";
  const html = render(read("src/templates/category.html"), {
    title: page.title,
    description: page.description.replace("{n}", n),
    canonical: `${SITE}${page.slug}/`,
    ogTitle: page.h1,
    structuredData: [breadcrumbs(page), itemList(page.h1, ls)].join("\n  "),
    h1: esc(page.h1),
    crumb: esc(page.crumb),
    answer: esc(page.answer.replace("{n}", n)),
    bandMedia: catMedia(page.band, root),
    chips: chips.length < 2 ? "" : `<div class="chips filter-chips" role="group" aria-label="Filter ${esc(page.crumb.toLowerCase())}">
          <button class="chip" type="button" aria-pressed="true" value="">All</button>
          ${chips.map(([v, t]) => `<button class="chip" type="button" aria-pressed="false" value="${esc(v)}">${esc(t)}</button>`).join("\n          ")}
        </div>`,
    listTitle: esc(page.list.replace("{n}", ls.length)),
    count: `${ls.length} ${ls.length === 1 ? one : many}`,
    disclosure: disclosure(ls, root),
    jump: grouped?.jump ?? "",
    listing: ls.length === 0
      ? `<p class="cat-empty">${esc(page.empty ?? "Nothing to show here yet. Check back soon.")}</p>`
      : grouped?.html ?? `<ul class="cat-grid" role="list">
      ${ls.map((l) => card(l, { root, attrs: ` data-filter="${esc(filterKeys(page, l).join(" "))}"` })).join("\n      ")}
        </ul>`,
    // 21+: listings stay hidden in the HTML until the gate is passed (js/site.js reveals them).
    listAttrs: gated ? " hidden data-gated" : "",
    extra: gated ? render(read("src/partials/21-plus-extra.html"), {}, root) : "",
    gate: gated ? render(read("src/partials/gate.html"), {}, root) : "",
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

used.clear();
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
  mapSvg: stripMap.svg,
  mapCards: stripMap.cards,
}, ""));

const built = [];
for (const page of pages) {
  const { html, count } = renderPage(page, "../");
  write(`${page.slug}/index.html`, html);
  built.push(`${page.slug} ${count}`);
}

used.clear();
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
