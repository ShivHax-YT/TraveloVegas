# MEDIA lane (Codex CLI). Generate every site image with your built-in image generation.

Rules (also in CLAUDE.md): no text, letters, logos, brand names, readable signs or watermarks in any image. Adults only. Nothing explicit, 21+ stays classy. No real celebrities. No recognizable real venue interiors.

You may ONLY write: assets/media/*.jpg and config/media.json. Do not touch any other file. Do not run git commands; the user commits.

For each image below, in order:
1. Generate it with built-in image generation (portrait for 4:5 items, landscape for 16:9 items). Add the STYLE line to every prompt.
2. Look at the result. Regenerate (max 3 tries) if it has any text or letters, a logo, garbled signage, extra or melted fingers, warped faces, or looks like a 3D render instead of a photo.
3. Crop and compress with ffmpeg into assets/media/<name>.jpg:
   4:5  -> ffmpeg -y -i IN -vf "scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350" -q:v 4 assets/media/<name>.jpg
   16:9 -> ffmpeg -y -i IN -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -q:v 4 assets/media/<name>.jpg
   Keep each file under 400KB (raise -q:v to 6 if needed).
4. Add it to config/media.json: "<name>.jpg": { "ai": true, "credit": "AI image" }

Also change these existing entries in config/media.json (the hero is now a montage with one AI-animated shot):
  "hero.mp4": { "ai": true, "credit": "Video: Pexels and DroneStock, one shot AI-animated" }
  "hero-mobile.mp4": { "ai": true, "credit": "Video: Pexels and DroneStock, one shot AI-animated" }
  "hero-poster.jpg": { "ai": false, "credit": "Video: DroneStock" }

When done, run `npm run build` and confirm it passes, then print a table: name, size KB, tries.

STYLE: Photorealistic editorial travel photograph, shot on a full-frame camera, natural color, warm gold highlights with magenta neon accents, deep clean shadows, fine film grain. Adults with natural faces and hands. No text, no letters, no logos, no brand names, no signage, no watermark.

## A. Homepage tiles, 4:5. Keep the bottom quarter darker and calm (a label sits there).
band-shows: From the dark back rows of a grand theater toward a stage washed in magenta and gold spotlights, haze in the beams, audience silhouettes in the foreground, red velvet seats.
band-free: A crowd at a lakeside railing at night, seen from behind, watching a huge choreographed water fountain show shoot into the air in front of an elegant Italian-style resort, mist and reflections on the lake.
band-food: Friends sharing Indian food at a restaurant table, shot from slightly above: paneer tikka, dal, naan, rice and a few cocktails, hands reaching in, warm light.
band-nightlife: Packed nightclub dance floor from a raised angle, hands up, confetti mid-air, gold and pink light beams through haze, motion blur, no face in sharp focus.
band-bars: A rooftop cocktail bar at blue hour, two friends at the glass rail holding cocktails, warm string lights, city lights far below fully out of focus.
band-pools: Friends laughing in a turquoise resort pool on floats, white cabanas and palm trees behind, bright desert sun, guests on loungers.
band-tours: A couple at a helicopter window seen from behind their shoulders, looking down at a vast red rock canyon with a river far below, morning light.
band-kids: A family with two young kids laughing on a colorful indoor amusement ride under a huge glass dome, bright playful color.
band-shopping: A grand indoor shopping promenade with a painted blue sky ceiling, marble floors and warm shop windows, shoppers with bags seen from behind.
band-events: A packed outdoor crowd at night seen from behind, hands up, fireworks bursting overhead, confetti in the air.
band-getting-around: Friends walking across a pedestrian bridge over a wide neon-lit boulevard at night, traffic light trails below, seen from behind.
band-21plus: Moody cocktail lounge at night, deep red velvet booth, brass lamp, one amber cocktail on marble in the foreground, soft pink neon glow, no people.

## B. Category page headers, 16:9. Keep the lower-left third darker and calm (headline sits there). Subject center-right.
cat-shows: Wide view from the back of a grand theater, the stage glowing with magenta and gold light, haze, rows of audience silhouettes.
cat-free: Wide night view of a choreographed water fountain show bursting across a resort lake, mist drifting, people along the railing in silhouette.
cat-food: Overhead of a long dinner table of vegetarian Indian dishes, thali, naan, paneer and dal, hands reaching in, warm candlelight.
cat-nightlife: Wide shot over a packed nightclub dance floor, confetti falling, gold and pink light beams through haze.
cat-bars: A rooftop bar at blue hour, people with cocktails at the rail, string lights, city lights below fully out of focus.
cat-pools: Aerial of a dayclub pool party, turquoise water full of people, palms and white cabanas, bright sun.
cat-tours: A helicopter with no markings flying over a vast red rock canyon, river far below, morning light.
cat-kids: A family exploring an indoor amusement park under a giant glass dome, colorful rides, kids pointing up.
cat-shopping: A long indoor shopping promenade with a painted sky ceiling, fountains and warm shop windows, shoppers in soft motion blur.
cat-events: A huge crowd seen from behind watching fireworks burst over a glowing city skyline that is out of focus.
cat-getting-around: A sleek white monorail train with no markings on an elevated track above palm trees and resort buildings at sunset.
cat-21plus: A dim cocktail lounge, red velvet booths, brass lamps, a bartender pouring a drink in warm backlight, pink neon glow.

## C. "One perfect Vegas night" story, 4:5.
story-1: Two friends clinking cocktails on a rooftop terrace at sunset, seen from the side, desert mountains glowing on the horizon, city lights below fully out of focus.
story-2: A shared dinner table from slightly above: fresh pasta, paneer skewers, red wine, candlelight, hands reaching in.
story-3: Audience view of a dark theater as the curtain rises, one performer silhouetted in a beam of gold light, rows of heads in silhouette.
story-4: A couple at a lakeside railing at night, seen from behind, watching a fountain show burst high into the air, mist and reflections.
story-5: Friends dancing in a crowded club, confetti, pink and gold light, motion blur.
story-6: A diner booth at 2am, a burger, fries and a milkshake, pink neon reflected in the window, two friends laughing out of focus.
