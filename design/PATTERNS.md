# Pattern recipes (use these exactly; tweak values only via tokens)

Derived from teardowns of tony-all-in-one.vercel.app and apex-vintage.com. Borrow the grammar, not the brand.

## 1. Header: clear -> frosted -> solid
- `position: fixed; height: var(--header-h)`. Over the hero: `background: rgba(14,11,20,.12); backdrop-filter: blur(10px)`; white text.
- JS toggles `.solid` when `scrollY > innerHeight * .6`: `background: rgba(247,242,234,.78); backdrop-filter: blur(20px) saturate(1.4)`; ink text.
- Toggles `.over-dark` when a `.is-dark` section sits under the header midpoint: solid `--night`, white text.
- Left: wordmark. Center (desktop): 5 links max (Shows, Free, Eat, Nightlife, Tours). Right: "Plan my night" pill button.
- Mobile: wordmark + menu button opening a full-height sheet. Plus a bottom bar after the hero: [Plan my night] [Free today].

## 2. Cinematic hero
- `100svh`, `--night` base. `<video autoplay muted playsinline preload="metadata" poster>`; `.ready` class fades it in on `loadeddata`.
- Image settle: media starts `scale(1.06)` and animates to 1 over 2.4s `var(--ease)`.
- Bottom gradient for legibility: `linear-gradient(to top, rgba(14,11,20,.85), transparent 55%)`.
- Text block bottom-left: eyebrow (gold, uppercase, tracked) -> H1 serif 300 at `--h-hero`, last phrase in `<em>` italic -> one support line -> one CTA + one ghost link.
- Staggered reveal: each line `opacity:0; translateY(var(--reveal-y))` -> in, delays .15/.35/.6/.8s.
- Parallax on scroll (rAF, passive listener): media `translate: 0 y*.3px`; text `translate: 0 y*.14px`, opacity `1 - p*.55`. Stop after 1.2 viewports.
- No auto-scroll.

## 3. Slide-over sections
- Section after a full-bleed one: `margin-top: -36px; border-radius: var(--r-section) var(--r-section) 0 0; position: relative; z-index: 2; box-shadow: 0 -24px 50px -20px rgba(14,11,20,.35)`.

## 4. Dark panel grow (one per page max)
- Section `::before` holds `--night` with `clip-path: inset(0 var(--mx) round var(--mr))`.
- JS maps progress `p = clamp((vh - top)/(vh*.75), 0, 1)` to `--mx: (1-p)*64px` (14px under 900px) and `--mr: (1-p)*34px`.

## 5. Category bands (Apex-style image index)
- 2-4 large image tiles per row, aspect 4/5, `--r-media`, label bottom-left in serif `--h-3` on a gradient.
- Hover/focus: image `scale(1.04)` over .9s, label lifts 4px. Whole tile is a real `<a>`.
- Mobile: horizontal rail with scroll-snap, 78vw tiles.

## 6. Horizontal rail (shows, tours)
- `display:grid; grid-auto-flow:column; grid-auto-columns: minmax(260px, 22vw); gap:18px; overflow-x:auto; scroll-snap-type:x mandatory`.
- Prev/next buttons on desktop; native swipe on touch. Edge fades with masks.
- Card: image 4/5, name (serif), venue (muted small), "from $X" ONLY if price is set, status pill, "Verified Oct 8" micro text.

## 7. Sticky story ("One perfect Vegas night, 6pm to 2am")
- Desktop: left sticky frame (`position:sticky; top: calc(var(--header-h) + 24px)`), right tall steps with `padding: 18vh 0 22vh`.
- IntersectionObserver with `rootMargin: "-45% 0px -45% 0px"` sets active step; images crossfade (opacity .7s, scale 1.06->1 1.4s); step details open via `grid-template-rows: 0fr -> 1fr`.
- Mobile: no sticky; each step shows its own image.

## 8. "Plan my night" picker (the signature interaction)
- Chips in 3 groups: Vibe (Thrills, Shows, Free, Food, Nightlife, Family), Budget ($, $$, $$$), Who (Solo, Couple, Friends, Kids).
- State machine: idle -> selecting -> results -> (edit). Results = up to 6 listings filtered from listings.json, rendered as rail cards.
- `aria-pressed` on chips; results region `aria-live="polite"`. Selections saved in localStorage (try/catch).

## 9. Strip map
- Hand-built inline SVG: Strip as a vertical line, resorts as labeled dots, monorail stations overlaid. Pins come from listings.json `map` coords.
- Tapping a pin opens a small card. Keyboard focusable. Static PNG fallback not needed (SVG is the content).

## 10. Status pills + freshness
- open = no pill; seasonal = gold "Seasonal"; temp_closed = warn "Reopens Nov 5"; changed/moved = sky "Moved"; Every card ends with `Verified {date}`.

## 11. FAQ
- Native `<details>`; plus icon rotates 45deg. FAQPage JSON-LD generated from the same data.

## 12. Footer
- `--night`. Oversized serif wordmark left, links right, affiliate disclosure paragraph, 21+ note, "Prices and schedules change. Always confirm with the venue."

## Motion budget per viewport
One hero motion, one reveal system, one signature interaction. Never parallax + marquee + autoplay in the same screen.
