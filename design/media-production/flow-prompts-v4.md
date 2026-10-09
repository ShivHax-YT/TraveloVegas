# TraveloVegas media, v4 (Oct 9, 2026). Replaces v3 and flow-prompts-improved.md.

## Settings
- STILLS: Flow > Image > Nano Banana 2.1 (rerun on Nano Banana Pro if it looks plastic). 4 outputs. Upscale pick to 2K.
  Tiles = portrait. Video start stills = 16:9.
- VIDEO: Flow > Video > Frames to Video, upload start image. 16:9, 8s, 2 outputs.
  Homepage hero = Veo 3.1 Quality. Page loops = Veo 3.1 Fast (Quality only if Fast looks off).
- STOCK start images: Unsplash or Pexels, landscape, largest size. Never YouTube frames.
- Reject any clip where a landmark warps or a sign turns to gibberish.

STYLE (end every IMAGE prompt with this):
Editorial travel photography, full-frame camera, natural color, warm gold highlights with magenta neon accents, deep clean shadows, fine grain. Real-looking adults with natural faces and hands, no celebrities. No text, no logos, no brand names, no watermarks.

FILM (end every VIDEO prompt with this):
Keep everything in the start image exactly as it is; no new buildings, signs or people appear. Smooth stabilized cinematic camera, real 4K travel documentary footage, natural motion, no text, no captions, no logos.

## 1. Homepage hero montage (8 shots, Veo 3.1 Quality). View guide = youtube/picks/<n>.
H1 South end, night | Stock: "Luxor Las Vegas night aerial" (pick 01)
Night aerial from the south end of the Las Vegas Strip: a black glass pyramid with a white light beam shooting straight up into the sky, the whole Strip of glowing resort towers stretching north behind it. Camera: very slow push forward with a slight rise. + FILM
H2 Boulevard, night | Stock: "Las Vegas Boulevard night aerial" (pick 02)
Night drone above the center of Las Vegas Boulevard, rising and gliding north, red and white traffic light trails below, a giant gold-lit sign and a green-lit hotel on the right, towers lining both sides. + FILM
H3 North end looking south | Stock: "Las Vegas Strip north end night aerial" (pick 04)
Night aerial at the north end of the Strip: a curved bronze glass tower on the left; the camera slides right to reveal the Strip stretching south, glowing towers and the boulevard. + FILM
H4 Distant | Stock: "Las Vegas valley night lights aerial" (pick 09)
High-altitude night aerial over the Las Vegas valley: endless orange street grid and highways in front, the Strip's towers glowing on the horizon. Camera glides slowly forward. + FILM
H5 Dusk | Stock: "High Roller Las Vegas sunset" (pick 08)
Las Vegas at dusk from the air: a giant observation wheel outlined in purple light in front, pink-lit hotel towers, orange sunset glow behind dark mountain ridges, city lights switching on. Camera slow push forward. + FILM
H6 Day | Stock: "Las Vegas Strip day aerial" (pick 10)
Daytime drone above Las Vegas Boulevard: a Statue of Liberty replica and a red roller coaster on the left, a green glass hotel on the right, palm trees, traffic, bright blue desert sky. Camera rises and pushes forward. + FILM
H7 Bellagio fountains | Stock: "Bellagio fountains night aerial" (pick 06)
Night aerial of the Bellagio fountains mid-show: water jets bursting, swaying and falling across the lake, mist drifting, reflections rippling, the gold-lit resort behind. Camera slow push forward. Realistic water physics. + FILM
H8 Paris / Eiffel | Stock: "Paris Las Vegas Eiffel Tower night" (pick 05)
Night view of the Paris-themed resort: gold-lit French facade, illuminated half-scale Eiffel Tower, the Strip's towers and spotlights behind. Camera slow slide left. + FILM

## 2. Homepage tiles = the purple boxes (9 stills, PORTRAIT). Also the fallback poster on each page.
band-shows: From the dark back rows of a grand theater toward a stage washed in magenta and gold spotlights, haze in the beams, audience silhouettes in the foreground, red velvet seats. Darker bottom quarter. + STYLE
band-free: STOCK, "Bellagio fountains night" (portrait or croppable).
band-food: Friends sharing Indian food at a restaurant table, shot from slightly above: paneer tikka, dal, naan, rice, a few cocktails, hands reaching in, warm light. + STYLE
band-nightlife: Packed nightclub dance floor from a raised angle, hands up, confetti mid-air, gold and pink light beams through haze, motion blur, faces not in sharp focus. Darker bottom quarter. + STYLE
band-pools: Friends laughing in a turquoise resort pool on floats, white cabanas and palm trees behind, bright desert sun, a few guests on loungers. + STYLE
band-tours: A couple at a helicopter window, seen from behind their shoulders, looking down at a vast red rock canyon with a river far below, morning light. + STYLE
band-getting-around: Friends walking across a pedestrian bridge over a wide neon-lit boulevard at night, traffic light trails below, seen from behind. + STYLE
band-events: A packed outdoor crowd at night seen from behind, hands up, fireworks bursting overhead, confetti in the air. + STYLE
band-21plus: Moody cocktail lounge at night, deep red velvet booth, brass lamp, one amber cocktail on marble in the foreground, soft pink neon glow, no people. Classy, not explicit. + STYLE

## 3. Page header loops (3 shots per page, about 12s loop, Veo 3.1 Fast)
GEN = make this 16:9 still first (+ STYLE), then use it as the start image.

SHOWS
shows-a | GEN: Wide view from the back of a dark grand theater, red velvet seats, audience silhouettes, a stage glowing behind a closed red curtain, haze.
Video: The curtain rises and gold and magenta spotlights sweep through the haze, audience silhouettes shift. Camera slow push toward the stage. + FILM
shows-b | GEN: An aerial performer in a flowing costume suspended high above a glowing turquoise pool on a dark stage, one spotlight, audience silhouettes in front.
Video: The performer slowly spins and drops a few feet on a silk, water ripples below, the spotlight follows. Camera nearly still. + FILM
shows-c | GEN: Close-up of a magician's hands fanning playing cards under a warm spotlight, black background.
Video: The hands fan and flip the cards smoothly and one card rises into the air. Camera locked, slight push in. + FILM

FREE
free-a | Stock: "Bellagio fountains" (from street level)
Video: Fountain jets rise and sway in a wave, mist drifts toward camera, crowd silhouettes along the railing. Camera slow slide right. + FILM
free-b | Stock: "Fremont Street Experience canopy"
Video: The LED canopy overhead ripples with abstract waves of color, crowds stroll below, neon signs glow. Camera walking-speed dolly forward. + FILM
free-c | Stock: "Welcome to Fabulous Las Vegas sign"
Video: Late afternoon at the welcome sign, palm fronds sway, a few tourists take photos, traffic passes behind. Camera slow push in. Keep the sign's lettering exactly as in the photo. + FILM

EAT
eat-a | GEN: A chef pulling fresh naan out of a glowing clay tandoor oven in a warm restaurant kitchen.
Video: The chef lifts the blistered naan out on a rod, heat shimmer and steam rise, flames flicker. Camera slow push. + FILM
eat-b | GEN: Overhead of a vegetarian Indian thali on a dark table: paneer, dal, rice, naan, chutneys in small bowls, warm light.
Video: Hands tear naan and dip it into the dal, steam rises. Camera slow overhead drift. + FILM
eat-c | GEN: A candlelit rooftop table for two at night, wine glasses, city lights fully out of focus behind.
Video: Candle flames flicker, a hand pours red wine, city lights twinkle as soft bokeh. Camera slow slide. + FILM

NIGHTLIFE
nightlife-a | GEN: Wide shot over a packed nightclub dance floor, hands up, light beams through haze.
Video: Confetti cannons fire, the crowd jumps, beams sweep. Camera slow push over the crowd. + FILM
nightlife-b | GEN: Close-up of a DJ's hands on a mixer and decks in colored LED light, no brand names visible.
Video: Hands slide a fader and turn a knob, lights pulse to the beat. Camera slight orbit. + FILM
nightlife-c | GEN: Servers carrying champagne bottles topped with bright sparklers through a dark nightclub crowd.
Video: The sparkler procession moves toward camera, sparks crackle, people cheer. Camera slow dolly backward. + FILM

POOLS
pools-a | GEN: Aerial of a dayclub pool party, turquoise water full of people, palms, cabanas, bright sun.
Video: Drone slowly rises over the party, people dance in the water, splashes sparkle. + FILM
pools-b | GEN: Close-up of a frozen fruit cocktail on the edge of a pool, turquoise water and blurred guests behind.
Video: Someone cannonballs in the background, droplets fly, the drink glints. Camera locked, slight focus shift. + FILM
pools-c | GEN: White cabanas with sheer curtains beside a quiet pool, palm shadows, afternoon sun.
Video: Curtains billow in the breeze, palm shadows sway, water shimmers. Camera slow slide. + FILM

TOURS
tours-a | GEN: A helicopter with no markings flying over a vast red rock canyon, river far below, morning light.
Video: The helicopter banks slowly over the canyon rim, shadows slide across the cliffs. Camera follows from behind and above. + FILM
tours-b | Stock: "Hoover Dam aerial"
Video: Slow aerial push toward the dam, calm reservoir water, a few cars crossing on top. Keep the dam exactly as in the photo. + FILM
tours-c | GEN: Two hikers on a red sandstone trail at golden hour, striped rock walls, desert scrub, seen from behind.
Video: The hikers walk away up the trail, warm light, dust drifts. Camera slow push following. + FILM

GETTING AROUND
getting-around-a | Stock: "Las Vegas Monorail"
Video: The monorail train glides along its elevated track past the camera, palms below. Keep the train and track exactly as in the photo. + FILM
getting-around-b | GEN: Friends crossing a pedestrian bridge over a wide neon-lit boulevard at night, seen from behind.
Video: They walk away across the bridge, traffic streaks below, neon reflections shimmer. Camera follows slowly. + FILM
getting-around-c | GEN: A rideshare car with no logos pulling up under a glowing hotel entrance canopy at night, a couple with a rolling suitcase waiting.
Video: The car rolls to a stop, the couple steps toward it, lights glide across the paint. Camera static. + FILM

EVENTS
events-a | GEN: Night street race, low open-wheel race cars on a city circuit lined with bright lights and grandstands, plain liveries, no logos, no numbers.
Video: Cars flash past left to right with light trails and sparks. Camera pans with them. + FILM
events-b | Stock: "Las Vegas Strip fireworks New Year"
Video: Fireworks burst in waves above the towers, smoke drifts, sparkles fall. Keep every building exactly as in the photo. + FILM
events-c | GEN: A rodeo rider on a bucking horse in a packed indoor arena, dust in the spotlight, crowd blurred.
Video: The horse bucks, dust kicks up, the crowd rises. Camera slow tracking. + FILM

21-PLUS (classy, never explicit)
21-plus-a | GEN: Dim cocktail lounge, red velvet booth, brass lamp, amber cocktail on marble, pink neon glow.
Video: A hand sets the drink down, ice settles, the neon glow flickers softly. Camera slow push. + FILM
21-plus-b | GEN: Close-up of a bartender pouring whiskey over one large ice cube, dark bar, warm backlight.
Video: Slow-motion pour, the ice turns, light glints through the glass. Camera locked. + FILM
21-plus-c | GEN: A late-night street of glowing neon storefront signs in abstract shapes, no readable words, rain-wet pavement reflecting the colors.
Video: The neon buzzes and flickers, reflections ripple in a puddle. Camera slow slide. + FILM

## 4. "One perfect night" story (6 stills, PORTRAIT, the section marked upcoming)
story-1: Two friends clinking cocktails on a rooftop terrace at sunset, seen from the side, desert mountains glowing on the horizon, city lights below fully out of focus. + STYLE
story-2: A shared dinner table from slightly above: fresh pasta, paneer skewers, red wine, candlelight, hands reaching in. + STYLE
story-3: Audience view of a dark theater as the curtain rises, one performer silhouetted in a beam of gold light, rows of heads in silhouette. + STYLE
story-4: STOCK, a different "Bellagio fountains night" photo.
story-5: Friends dancing in a crowded club, confetti, pink and gold light, motion blur. + STYLE
story-6: Diner booth at 2am, burger, fries and a milkshake, pink neon reflected in the window, two friends laughing out of focus. + STYLE

## Save as
incoming/hero/shot-01.mp4 ... shot-08.mp4
incoming/bands/band-<name>.jpg
incoming/pages/<slug>-a.mp4, -b, -c   (slugs: shows free eat nightlife pools tours getting-around events 21-plus)
incoming/story/story-1.jpg ... story-6.jpg
Claude then trims, stitches, crops the phone versions, makes posters and compresses.
