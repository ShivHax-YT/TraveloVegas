# Models and reference workflow for TraveloVegas

Researched October 9, 2026. Use **Nano Banana Pro for reference image edits**, then **Gemini Omni Flash 1.1 when a sample video must guide camera motion**. Use **Veo 3.1 Quality for an approved first frame with written motion direction**. This is a capability-based recommendation for these shots, not a claim that one model always produces the best footage.

| Task | Model and Flow mode | Inputs |
| --- | --- | --- |
| Combine the Sphere night view with the yellow face | Nano Banana Pro, Image editing | USER-SPHERE-NIGHT-02 defines the scene; USER-SPHERE-FACE-03 defines only the LED artwork. |
| Category images, story images, hero poster, social image | Nano Banana Pro, Image | Reference photos listed in each prompt; use Nano Banana 2.1 or 2 Lite for initial drafts when available. |
| Transfer slow drone movement from a sample clip | Gemini Omni Flash 1.1, Video → Ingredients | Approved location still plus one acquired motion-reference video; explicitly assign each input's role. |
| Animate a still without uploading a motion clip | Veo 3.1 Quality, Video → Frames | Approved start image; describe the move in text. Veo 3.1 Fast is suitable for a cheaper motion test. |
| Change the Sphere display in actual footage | Gemini Omni Flash 1.1, video editing | Authorized real footage segment of no more than 10 seconds, plus the face reference. This provides a filmed starting scene but still requires distortion checks. |

Google lists both landscape and portrait support. Veo 3.1 Quality supports frames, but **does not support Ingredients or video-to-video editing**. Veo 3.1 Fast supports image ingredients but also lacks video editing. Omni Flash 1.1 supports Ingredients and editing uploaded video up to 10 seconds. Check the active mode and model before generating; Flow can flag unsupported combinations. [Google's current feature matrix](https://support.google.com/flow/answer/16352836?hl=en)

Google documents dragging an image **or video** into Video → Ingredients and describing its intended role. Its Omni examples demonstrate transferring camera movement and motion from video references. Those documented capabilities justify Omni for your sample-drone workflow; exact skyline preservation is an output check, not a guaranteed property. [Flow reference instructions](https://support.google.com/flow/answer/16353334), [Google's Omni examples](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/)

Nano Banana Pro supports combining reference images and controlled editing. Flow keeps image edit history. Use that to settle the composition before spending video credits. [Nano Banana Pro](https://deepmind.google/models/gemini-image/pro/), [Flow image editing](https://support.google.com/flow/answer/16729550?hl=en)

## Production sequence

1. Open [reference-board.html](reference-board.html). Select the location image and, for video, a motion sample. The IDs resolve through [reference-manifest.csv](reference-manifest.csv).
2. Prepare the still in Nano Banana Pro. The Sphere composite is already staged at `references/generated/sphere-night-smiley-v1.png`; it was made here with the built-in image generator, **not** with Nano Banana Pro. Review its geometry before treating it as the final frame.
3. Choose one video route: Omni Ingredients for actual sample-video conditioning, or Veo Quality Frames for text-directed motion. Do not paste multi-video instructions into Veo Quality.
4. Start with one 8-second motion test. A slow, small camera move is safer for landmark geometry than a large orbit that requires invented unseen surfaces. Inspect the beginning, middle, and end for drifting buildings, bent roads, changing Sphere scale, LED artifacts, and altered faces.
5. Generate the portrait composition separately using a truthful crop or a real portrait reference. A model should not relocate hotels to fit a 9:16 screen. The existing mobile hero needs its own first frame.
6. Choose the finished clip by visual fidelity. Trim and crossfade it in editing if a loop is needed; a forward drone move cannot naturally have identical first and last views. Export a clean muted web derivative and its poster after that check.

For exact geography, the strongest alternative is to license a real drone clip and use it directly. It avoids generative building drift. If the face must change, edit only that display in a short real clip and inspect the result. Location photos and motion samples help generation, but do not make a generated scene documentary footage.

## Credits and resolution

Google's published costs per output at the research date:

| Operation | Credits |
| --- | ---: |
| Omni 720p, 8 seconds | 12 |
| Omni 360p, 8-second draft | 6 |
| Omni editing uploaded/generated video | 40 |
| Veo 3.1 Fast | 20 non-Ultra / 10 Ultra |
| Veo 3.1 Quality | 100 |

A request with multiple outputs can consume multiple generations. Treat 360p as a motion draft. Upscaling is separate from native capture detail; “4K” in a prompt does not ensure native 4K footage. Subscription rules and costs can change, so use the settings shown in Flow at generation time. Your account's available models, subscription and credit balance have not been inspected or changed. [Google's credit and upscaling table](https://support.google.com/flow/answer/16526234?hl=en)

Outside Flow, **Seedance 2.0** documents image/video references and camera-motion copying. It is a plausible alternate if your service exposes those inputs; its availability in your account has not been tested. Keep this project on Flow unless its reference workflow proves inadequate. [Official Seedance 2.0 launch](https://seed.bytedance.com/en/blog/official-launch-of-seedance-2-0)

See [reference-guide.md](reference-guide.md) for footage samples and source roles, and [flow-prompts-improved.md](flow-prompts-improved.md) for the shot list.
