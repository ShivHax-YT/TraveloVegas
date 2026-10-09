# TraveloVegas — project brain (read this first, every session)

## What this is
A Las Vegas visitor guide for tourists planning a trip. Not a booking business. Revenue = affiliate commissions:
- VEGAS.com (shows, attractions, nightlife, pool parties) via FlexOffers/Impact, ~5%
- Viator + GetYourGuide (tours, Grand Canyon, helicopters) ~8%
- OpenTable (restaurants) = trust/UX link, assume $0 revenue
Domain: travelovegas.com (being re-registered). Host: Cloudflare Pages. Repo: github.com/ShivHax-YT/TraveloVegas

## Stack (do not change without asking)
- Static site: plain HTML + CSS + vanilla JS. No React, no Tailwind, no framework.
- Lenis smooth scroll from jsDelivr. Nothing else from CDNs except Google Fonts.
- ALL copy and listings are in the HTML at build time or rendered from `data/listings.json` by a tiny build script (`scripts/build.mjs`) into static HTML. Google must see real text. No client-only content.
- Design system lives in `design/tokens.css` and `design/PATTERNS.md`. Use them. Never invent new colors, fonts, easings or radii.

## Hard rules
1. One CSS rule per selector. When changing a style, EDIT the existing rule. Never append override blocks at the bottom. (The reference site rotted from 5 copies of the same selector.)
2. Every listing card shows `last_checked`. Never show a listing with status `closed`. `temp_closed` / `seasonal` get a banner. Never show a price/hours that is null; never invent one.
3. No affiliate links on strip club, adult show or cannabis pages. Those pages are informational, 21+ gated, no explicit imagery.
4. Affiliate disclosure line near every affiliate link block + full disclosure in the footer (FTC).
5. AI-generated images get a small "Illustrative" caption. No logos or real trademarked signage in AI imagery.
6. Respect `prefers-reduced-motion` everywhere. Animate only transform, opacity, clip-path.
7. Mobile first. Test 390 / 768 / 1440. No horizontal scroll at 320.
8. No em dashes in site copy. Short, plain, local voice ("Let the fun begin").
9. Never claim something is open, free, or a price unless listings.json says so with a source.

## Workflow
- Small rounds. One section or one problem per round. Stop and show screenshots after each round.
- The screenshot hook writes `screens/latest/{1440,768,390}.png` after each turn. Look at them before saying a round is done.
- Codex auto-reviews every commit on main into `reviews/LATEST.md`. At the start of each round, read it and fix critical/high items first. Ignore polish unless asked.
- Commit at the end of every round (`git commit -am "round N: ..."`) so the reviewer runs.
- A separate DATA lane edits `data/` in its own worktree (branch lane/data). Never edit data/ yourself; merge with `git merge lane/data` when asked.

## Files
- `design/tokens.css` – the design system
- `design/PATTERNS.md` – exact recipes for every UI pattern
- `data/listings.json` – content source of truth (status + sources + last_checked)
- `prompts-archive/flow-prompts.md` – Google Flow image/video prompts; generated media goes in `assets/media/`
- `prompts-archive/` – build prompts (run in order) and the Codex review prompt
