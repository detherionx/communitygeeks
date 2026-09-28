# Communitygeeks — rear-projected identity

Latest approved direction: full head-sized cream quiff, one eyebrow and glasses projected forward from the rear interior of the helmet. Dark petrol glass sits in front. No rectangular screen, no collar projector, no painted visor mark.

`communitygeeks-astronaut-full.svg` is the full-body front-facing master holding the orange module. PNG and lossless WebP versions accompany it. `rear-projection-reference.svg` and `.png` preserve the approved front/three-quarter/profile study.

All SVGs are self-contained containers with embedded PNG artwork, not editable vector paths. The full-body image is transparent. The study has its original cream background. Use the native pixel dimensions in `manifest.json` when preparing print work; SVG packaging does not create unlimited resolution.

The rear-projection study was approved by the user. The full-body master is derived from it. The local site now loads `src/assets/images/crew-rear-projection/` through the shared astronaut macro. The `poses/` folder contains ten matching website orientations: six edited views with internal projection and four retained rear views where the face is occluded by helmet shell. Rear shell geometry is deliberately preserved. Older `crew-approved` assets and `handoff/communitygeeks-astronauts` belong to the preceding soft-display iteration.

Opus's next pass concerns copy, typography and usability. Preserve this active pose set during that pass. See `../opus-5.5-copy-typography.md` and project-root `CLAUDE.md`. Validate asset usage with `node --test scripts/test-rear-projection-crew.cjs` after an Eleventy build. Set `CHECK_LIVE_CREW=1` to include HTTP byte checks against port 8081.

Generated with the built-in image generation tool. Prompt record: `generation-notes.md`. SVG embedding and WebP conversion preserve the generated artwork. No production deployment included.
