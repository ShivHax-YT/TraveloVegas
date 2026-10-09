// Builds dist/: renders src/*.html with listings from data/listings.json, copies css (tokens inlined), js and assets.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "dist";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RAIL_STATUS = { open: 0, seasonal: 1, temp_closed: 2 }; // also the sort order

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "2026-10-08" -> "Oct 8" (year only when it isn't this year). Parsed by hand so time zones can't shift the day.
const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}${y === new Date().getFullYear() ? "" : `, ${y}`}`;
};

const pill = (l) => {
  if (l.status === "seasonal") return `<p class="pill pill-seasonal">Seasonal</p>`;
  if (l.status === "temp_closed") return `<p class="pill pill-closed">${l.reopens ? `Reopens ${shortDate(l.reopens)}` : "Temporarily closed"}</p>`;
  return "";
};

const card = (l) => {
  const sourced = l.sources?.length > 0; // never show a price without a source
  const price = l.price != null && sourced ? `<p class="card-price">from ${typeof l.price === "number" ? `$${l.price}` : esc(l.price)}</p>` : "";
  return `<li class="card">
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

const tokens = {
  onThisWeek: onThisWeek.map(card).join("\n      "),
  year: String(new Date().getFullYear()),
};

// Replaces @import "x.css"; with the file's contents so the browser fetches one stylesheet.
const inlineCss = (file) =>
  readFileSync(file, "utf8").replace(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g, (_, p) => inlineCss(join(dirname(file), p)));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "css"), { recursive: true });

for (const f of readdirSync("src").filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join("src", f), "utf8").replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in tokens)) throw new Error(`build: unknown token {{${k}}} in src/${f}`);
    return tokens[k];
  });
  writeFileSync(join(OUT, f), html);
}
for (const f of readdirSync("css").filter((f) => f.endsWith(".css"))) writeFileSync(join(OUT, "css", f), inlineCss(join("css", f)));
cpSync("js", join(OUT, "js"), { recursive: true });
if (existsSync("assets")) cpSync("assets", join(OUT, "assets"), { recursive: true });

console.log(`build: ${live.length} live listings (${data.listings.length - live.length} closed skipped), ${onThisWeek.length} on this week -> ${OUT}/`);
