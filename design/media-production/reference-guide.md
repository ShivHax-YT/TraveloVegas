# Reference pack for TraveloVegas

The pack contains **15 local reference images**, **two ready-to-upload 8-second motion clips**, and **one additional 4K twilight montage for visual inspiration**. All 29 shot-list rows name specific inputs. Original attachments, downloaded sources and the generated Sphere candidate are kept in separate folders under `references/`; none is installed in `assets/media/`.

Open [reference-board.html](reference-board.html) to see the images and play the sample clips. [reference-manifest.csv](reference-manifest.csv) maps every ID to its file, source, role, credit and status. [shot-reference-map.csv](shot-reference-map.csv) maps all 29 output filenames to their inputs. Future `DERIVED-*` entries describe starting frames/stills that have not been made yet; the actual source references for producing them are already supplied.

## Your Sphere direction

- **USER-SPHERE-NIGHT-02**: your image #2 controls the entire night view, camera angle, skyline, roads and Sphere shape.
- **USER-SPHERE-FACE-03**: your image #3 controls only the yellow LED face: thick brows, white eyes, dark pupils and small smile. Its daylight surroundings do not transfer.
- **GEN-SPHERE-01**: [sphere-night-smiley-v1.png](references/generated/sphere-night-smiley-v1.png), a composite created here with the built-in image generator. Visual review found the requested viewpoint and face treatment aligned. It regenerates some source detail and is a reference candidate, not a pixel-identical photograph or an installed production hero.

The yellow character is officially named **Orbi**. Its official artwork and the [XO Stream](https://thesphere.com/xo-stream) are supplemental display references. Your two supplied photos remain the creative authority. [Sphere's Orbi announcement](https://investor.sphereentertainmentco.com/press-releases/news-details/2025/HELLO-MY-NAME-IS-ORBI/default.aspx)

## Cinematic aerial samples

| ID | Local input / source | What it contributes |
| --- | --- | --- |
| VIDEO-DRONE-01 | [8-second night excerpt](references/motion/video-drone-01-motion-8s.mp4); [Pexels original](https://www.pexels.com/video/aerial-night-view-of-las-vegas-skyline-32089177/) | Smooth lateral/orbit movement past New York-New York. Beginning/middle/end frames inspected; it is not a forward boulevard push. Use only its stabilized motion, greatly reduced in the generated shot. Source master retained at 3840 x 2160, 25 seconds. |
| VIDEO-DRONE-02 | [8-second Wynn excerpt](references/motion/video-drone-02-motion-8s.mp4); [DroneStock source](https://dronestock.com/aerial-drone-stock-video-wynn-rise-las-vegas-m0116040355/) | Lateral flight and gradual rise. Keep the photo's geography; do not import Wynn, its golf course or sunset. Downloaded stream is 1280 x 720, 24.19 seconds; the page separately advertises 1080p. |
| VIDEO-DRONE-04 | [Twilight montage](references/motion/video-drone-04-twilight.mp4); [Pexels original](https://www.pexels.com/video/las-vegas-casino-drone-shot-18065155/) | Palms-area twilight exposure and composition ideas. Checked frames reveal several different shots. Keep this as inspiration; the whole montage is unsuitable for conditioning one continuous camera move. |
| VIDEO-DRONE-03 | [Pond5 Sphere orbit preview](https://www.pond5.com/it/stock-footage/item/278276585-circular-aerial-drone-view-sunrise-sphere-las-vegas-united-s) | Optional specific Sphere orbit/parallax study. Sunrise is not the requested lighting. Paid clip has not been acquired; duration unconfirmed. The main Sphere prompt uses the local night motion excerpt instead. |
| VIDEO-AERIAL-ARCHIVE | [Axiom night flyover preview](https://www.axiomimages.com/aerial-stock-footage/view/DCA03_060) | An alternate forward aerial-glide study, 15 seconds, shot February 26, 2010. Current geography and drone capture are not established. Paid clip has not been acquired. |

The two 8-second clips are silent 720p motion-reference derivatives from seconds 2–10 of their retained sources. They are input aids, not the finished website videos. Their filenames preserve the IDs used in the prompts. Omni Ingredients can use an actual video reference; Veo Quality Frames uses a starting image and written direction. See [model-selection.md](model-selection.md) for the verified model choices and costs.

## Image references and limits

| ID | Actual subject | Important limit |
| --- | --- | --- |
| REF-SHOWS | [O pool and auditorium](references/catalog/ref-shows.jpg) | Visible pool-to-seating view, red seats, warm arches; no unseen stage design. |
| REF-NIGHTLIFE | [OMNIA crowd and chandelier](references/catalog/ref-nightlife.jpg) | Club architecture, lighting and believable crowd density. |
| REF-POOLS | [Encore Beach Club pool](references/catalog/ref-pools.jpg) | Actual pool shape, palms, shade structures and daylight; source is a quiet empty pool. |
| REF-FOOD | [Grilled paneer tikka](references/catalog/ref-food.jpg) | Dish texture, paneer shape, char and chutney; not a Las Vegas venue. |
| REF-FREE | [Bellagio fountains at dusk](references/catalog/ref-free.webp) | Frontal lake, hotel and fountain relationship. 639px website crop; not a delivery master. |
| REF-TOURS | [Helicopter and canyon](references/catalog/ref-tours.jpg) | Visible aircraft and canyon formations; photo filename identifies South Rim, no itinerary claim. |
| REF-TRANSIT | [Monorail / Convention Center](references/catalog/ref-transit.jpg) | Golden-hour train, elevated guideway and actual Convention Center surroundings. |
| REF-21PLUS | [Overlook Lounge materials](references/catalog/ref-21plus.jpg) | Red/pink upholstery, gold lamps, curtains and small tables; general lounge illustration only. |
| REF-KIDS | [Adventuredome swing carousel](references/catalog/ref-kids.webp) | Actual swing carousel, chains, suspended seats and dome structure; not a roller coaster. |
| REF-FOOD-PASTA | [LAGO mafaldine](references/catalog/ref-food-pasta.jpg) | Pasta ribbons, food texture, portion and plating; no invented restaurant location. |
| REF-LATE-BITE | [Grand Lux entrance](references/catalog/ref-late-bite.jpg) | Entrance facade, warm arches and partial dining-area glimpse; not a complete interior view. |

Your south-Strip source is 752 x 424; the Bellagio website crop is 639 x 320; several other category references are below 1200px. These can anchor subject and composition but are not high-resolution delivery masters. Retain truthful geometry and obtain a larger authorized source when exact detail matters. A generated image still needs review at the site's real portrait tile and shallow landscape header crops.

## Source status

The user images were copied intact. Venue/gallery photographs were downloaded for reference research; their publication and AI-upload permissions are not established by the source page. They should be replaced with authorized media before commercial use where necessary. The paneer photo and two Pexels videos have the [Pexels license](https://www.pexels.com/license/), which allows free use and editing subject to its restrictions. DroneStock's [terms](https://dronestock.com/terms/) identify its downloads as CC0. Credits and original URLs are retained in the manifest. No paid footage was purchased, no Flow credits were spent, and no files were uploaded to a Flow account.

Named listing images remain the separate real-photo acquisition plan in [listing-media-plan.csv](listing-media-plan.csv); these 257 entries are not synthetic venue-photo prompts. The site source and its media wiring were not changed. The optional Sphere outputs and eight dedicated category-header variants remain unwired, as described in [project-map.md](project-map.md).

