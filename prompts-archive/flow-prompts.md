# Google Flow (Veo / Imagen) shot list

Rules for every shot: 16:9 unless noted, no logos, no readable signs, no recognizable trademarked buildings up close, no faces in focus, leave negative space for headline text. Make 3-4 takes, keep the best. Save to `assets/media/` with the file name shown. Every AI asset is captioned "Illustrative" on the site.

| File | Type | Prompt |
|---|---|---|
| hero.mp4 (8s) + hero-poster.jpg | Video | Slow aerial drone push toward a glittering desert city skyline at blue hour, warm neon glow beginning to light up, mountains silhouetted behind, soft purple and amber sky, light haze, smooth steady motion, empty sky in the upper third, photorealistic, cinematic, 4K, no text, no logos. |
| hero-mobile.mp4 (8s, 9:16) | Video | Same scene as hero, vertical framing, skyline in the lower half, sky above for text. |
| band-shows.jpg | Image | Dark theater stage moments before a show, deep red velvet curtain catching one warm spotlight, dust floating in the beam, rich shadows, no people, no text. |
| band-nightlife.jpg | Image | Crowd silhouettes with raised hands under sweeping violet and magenta lights and haze in a large club, shot from behind, motion blur, no faces, no logos. |
| band-pools.jpg | Image | Luxury desert resort pool at golden hour, palms, white-curtained cabanas, turquoise water, two champagne glasses on the ledge in the foreground, warm light, no faces. |
| band-food.jpg | Image | Overhead candlelit dinner table: pasta, sushi, a seared steak, wine glasses, dark wood, warm restaurant glow, shallow depth of field. |
| band-free.jpg | Image | Huge dancing water fountain show at night, jets lit gold and white, silhouettes at a railing in the foreground, cinematic long exposure. |
| band-tours.jpg | Image | Red helicopter flying low over a vast red-rock desert canyon at sunrise, river far below, epic scale, crisp light. |
| band-getting-around.jpg | Image | Long-exposure night boulevard with neon glow and traffic light trails, elevated train track above, energetic, no readable signs. |
| band-21plus.jpg | Image | Moody velvet lounge booth with neon purple glow, cocktail glass with condensation, smoke haze, nobody in frame, tasteful, no text. |
| band-kids.jpg | Image | Colorful indoor theme park under a giant glass dome, a roller coaster loop blurred with motion, bright and playful, no faces. |
| story-1..6.jpg | Image | "One perfect night" chapters, all same color grade (teal shadows, amber highlights): 1 sunset cocktails on a terrace over the city; 2 dinner by a window with city lights; 3 theater seats as the lights dim; 4 fountain show from a bridge; 5 club lights and confetti; 6 empty neon street at 2am with a food truck glow. |
| og-image.jpg (1200x630) | Image | Hero still with extra space on the left for the wordmark. |

Video tips: ask Flow for "seamless loop, last frame matches first frame". Export H.264, compress hero to under 2 MB (`ffmpeg -i in.mp4 -vcodec libx264 -crf 28 -preset slow -an -vf scale=1600:-2 hero.mp4`).
