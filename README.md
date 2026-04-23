# resume-site

Suave pitch-black homepage for an engineering & public policy resume, with
three hover variants for the `BIO / PROJECTS / EXPERIENCE` navigation.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Variants

A small pill in the bottom-right corner lets you switch live between:

- **A** — plain hover grey (white → `#888`, 150ms)
- **B** — paint splotch fills on hover, reverses when you move away
- **C** — paint splotch fills once per hover, no reverse

The current variant is reflected in the URL (`?variant=plain|splotch-reverse|splotch-once`)
and also saved to `localStorage`, so reloads remember your pick.

Users with `prefers-reduced-motion` enabled get an instant swap instead of the
animation.

## Swap points

**Font** — `src/app/layout.tsx` loads `Oswald` via `next/font/google`. To try
`Anton`, replace the import and the `Oswald({...})` call. The `.nav-label`
rule in `src/app/globals.css` uses the `--font-display` CSS variable, so no
other change is needed.

**Splotch fill color** — defined once as `--color-paper` in
`src/app/globals.css` (`@theme`). Change it there to retune the hover color.
To swap it per-variant, pass `fillColor` through `NavButton` to the variant
components.

**Blob count / shape** — `generateBlobs(label, count)` in
`src/components/splotch/blobs.ts`. Tweak the `count` (currently `8`), the
`rMax` range, or the per-blob `delay` / `duration` to retune the splat feel.

## Structure

```
src/
  app/
    layout.tsx        # loads Oswald, sets black background
    page.tsx          # home, wraps HomeClient in <Suspense>
    bio/              # stub
    projects/         # stub
    experience/       # stub
  components/
    HomeClient.tsx    # reads ?variant= + localStorage, renders NavTrio + switcher
    NavTrio.tsx       # horizontal row of three NavButtons
    NavButton.tsx     # dispatches to the active variant
    VariantSwitcher.tsx
    variants/
      PlainHover.tsx
      SplotchHover.tsx
      SplotchOneShot.tsx
    splotch/
      blobs.ts                # seeded blob generator + easing
      useAnimatedProgress.ts  # rAF-driven tween hook
      SplotchLabel.tsx        # SVG mask + gooey filter
  lib/
    variants.ts
```
