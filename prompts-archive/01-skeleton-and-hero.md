Read CLAUDE.md, design/tokens.css, design/PATTERNS.md and data/listings.json fully before writing code.

Goal of this round: the home page skeleton + hero only. Real structure and copy, placeholder media where Flow assets aren't in assets/media yet (use solid --night/--dusk blocks with the right aspect ratios).

Build:
1. package.json with scripts: "build" (node scripts/build.mjs), "dev" (npx serve dist -l 4321), "shots" (node scripts/shots.mjs). Dev deps: playwright, serve.
2. scripts/build.mjs: reads data/listings.json + src/*.html templates, writes static HTML into dist/ (copy assets, css, js). Only listings with status != "closed" render.
3. src/index.html sections, in order:
   - Header (pattern 1)
   - Hero (pattern 2). Eyebrow "Las Vegas, verified weekly". H1: "The Strip, <em>without the guesswork.</em>" Support line: "Shows, free spectacles, food and nights out, checked by locals and updated every week." CTA "Plan my night" + ghost link "What's free today".
   - Category bands (pattern 5): Shows, Free, Eat, Nightlife, Pools, Tours, Getting around, 21+.
   - "On this week" rail (pattern 6) from listings with status open/seasonal/temp_closed.
   - Placeholder blocks (headline + one line each, no build yet): Plan my night, One perfect night story, Strip map, FAQ.
   - Footer (pattern 12) with affiliate disclosure.
4. css/site.css importing design/tokens.css. js/site.js for header states, hero reveal/parallax, Lenis.
5. Fonts: Fraunces (300,400, italic 300) + Inter Tight (400,500,600) from Google Fonts.

Then: npm run build && npm run shots. Look at screens/latest/*.png yourself and fix anything broken at 390/768/1440 (overflow, overlap, unreadable text). Stop and report: what you built, the three screenshot paths, and the 3 weakest things you see.
