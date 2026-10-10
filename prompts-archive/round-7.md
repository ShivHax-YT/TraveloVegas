# BUILD round 7 (launch round). Read CLAUDE.md first.
Commit after each part (7a to 7f) with "round 7a: ..." etc. Do NOT edit config/media.json or assets/media: the MEDIA lane (Codex) owns them and is generating images right now. Code against the file names below; when a file is missing, keep the existing placeholder.

## 7a Hero
1. Pause the hero video when the hero scrolls out of view (IntersectionObserver) and resume when it comes back, unless the visitor pressed pause or reduced motion is on. Same for category videos.
2. hero.mp4 is now a 15s montage: Wynn at sunset, twilight skyline, dusk skyline, New York-New York at night. Re-measure scrim contrast on these frames at 390/768/1440, especially the bright sunset sky in the first 4 seconds. Edit the existing scrim rule, don't append.
3. Footer credits: list the credit of every media file used on the page, AI or not (today AI entries are dropped).

## 7b Tiles and category headers
4. Category hero order: cat-<band>.mp4, then cat-<band>.jpg (new: 1920x1080), then band-<band>.jpg, then placeholder.
5. Category pages use cat-<band>.jpg as og:image when it exists.
6. Homepage tiles become 12, in this order: Shows, Free, Eat, Nightlife, Bars, Pools, Tours, Kids, Shopping, Events, Getting around, 21+. 4 across on desktop, 2 on mobile. Image keys: band-shows, band-free, band-food, band-nightlife, band-bars, band-pools, band-tours, band-kids, band-shopping, band-events, band-getting-around, band-21plus.

## 7c New pages (src/pages.json, header nav if it fits, footer, sitemap)
7. /bars/: categories ["bars"], band "bars", h1 "Las Vegas bars and lounges".
8. /shopping/: categories ["shopping"], band "shopping", h1 "Shopping in Las Vegas".
9. /kids/: every confirmed listing tagged "family" from any non-adult category, grouped by category with "Show all", band "kids", h1 "Las Vegas with kids".
   They show the empty state until DATA's listings merge. Write title, description and answer lines in the same style as the others.

## 7d One perfect Vegas night (replace the "upcoming" story placeholder)
10. Build pattern 7 "Sticky story" from design/PATTERNS.md exactly. Images story-1.jpg to story-6.jpg (4:5).
11. Stops: 6pm sunset drinks (link /bars/), 8pm dinner (/eat/), 9:30pm a show (/shows/), 11pm the fountains (/free/), midnight out late (/nightlife/), 2am late bite (/eat/). One or two short plain sentences each, no em dashes, no prices, hours or claims the data doesn't back.

## 7e Trust pages
12. /about/: what TraveloVegas is, that it's run by a family in Las Vegas, how listings are verified (sources plus a last-checked date on every card), how the site makes money. Put <!-- PARENTS BIO + PHOTO --> where a bio goes later. Invent nothing.
13. /privacy/: Cloudflare Web Analytics (cookieless, no personal data), localStorage used only for the 21+ gate and UI state, affiliate partners (VEGAS.com, Viator, GetYourGuide, OpenTable) may set their own cookies after a visitor clicks out.
14. /disclosure/: full FTC affiliate disclosure. Link About, Privacy and Disclosure in the footer.
15. Listings whose notes start with "unconfirmed": no booking button; show "Check the official site before you go" instead.

## 7f Launch readiness
16. Emit dist/_headers for Cloudflare Pages: Cache-Control "public, max-age=31536000, immutable" for /assets/media/*; one day for css/js unless they're fingerprinted; plus X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, a minimal Permissions-Policy.
17. Run Lighthouse (npx lighthouse, mobile preset, Playwright's Chromium via --chrome-path) on /, /shows/, /eat/ and /21-plus/ served from dist. Fix anything under 90 in Performance, Accessibility, Best Practices or SEO. Report the four scores per page.
18. Final screenshots at 390 and 1440 of /, /shows/, /kids/ and /about/.
