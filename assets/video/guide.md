# loopsmith videos (Remotion)

This folder holds the [Remotion](https://www.remotion.dev) project that renders
loopsmith's marketing and demo videos (launch clips, social posts, explainers).
Videos are generated from code, so there is no manual screen recording or editing.

## Why it lives here, and why it is not on npm

It sits under `assets/video/` so all brand and media tooling stays together. It is
deliberately kept **out of the published npm package**: the root `package.json`
`files` whitelist is `["bin", "skills", "assets/*.svg"]`, so only the two logo SVGs
ship to npm. This whole project, its `node_modules`, and every rendered video are
excluded from the package. (`node_modules` is also git-ignored.)

## Output rule: never overwrite, always accumulate

Every render goes into `output/` and **must use a fresh, descriptive name**. We do
not overwrite old videos, so each version stays around for reference and reuse.

This is enforced in `remotion.config.ts` with `Config.setOverwriteOutput(false)`:
if you render to a name that already exists, the render fails on purpose instead of
clobbering the old file.

Naming convention: `<concept>-v<n>.mp4`.

```
output/launch-loop-v1.mp4      first launch clip
output/launch-loop-v2.mp4      a revised launch clip
output/how-it-works-v1.mp4     a different concept
```

## Render a video

First time only, install dependencies:

```
cd assets/video
npm install
```

Preview in the Remotion Studio (live, hot-reloading):

```
npm run dev
```

Render a composition to a new file in `output/` (pick a fresh name):

```
npx remotion render LaunchLoop output/launch-loop-v2.mp4
```

Quick visual sanity check of a single frame (no full render):

```
npx remotion still LaunchLoop output/_frame.png --frame=330 --scale=0.5
```

## Current compositions

| id | size | length | what it is |
|----|------|--------|------------|
| `LaunchLoop` | 1080x1080 | 15s @ 30fps | Launch clip: logo, `npx loopsmith` install, the maker/checker/retry loop animating to PASS, and the closing command. Square, autoplays muted on X, loop-friendly. |

## Add a new video

1. Create a new component in `src/` (for example `src/HowItWorks.tsx`).
2. Register it as a `<Composition>` in `src/Root.tsx` with its own `id`, size, and `durationInFrames`.
3. Render it to `output/<name>-v1.mp4`.

Keep the palette and the logo mark consistent with the brand: the colors and the
loop-arrow + checkmark mark are defined inline in `src/LaunchLoop.tsx` and can be
reused. Note: CSS transitions/animations and Tailwind classes do not render in
Remotion. Animate with `useCurrentFrame()`, `interpolate()`, and `spring()`.
