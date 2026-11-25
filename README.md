# Percy Nguyen — portfolio

React + Vite site with Lenis smooth scrolling, GSAP/ScrollTrigger animation and a React Three Fiber background.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

Pushing to `main` builds the site and deploys `dist/` to Neocities (`.github/workflows/deploy.yml`, needs the `NEOCITIES_API_TOKEN` repository secret).

## Where things live

| Path | What it is |
|---|---|
| `src/providers/SmoothScroll.jsx` | Lenis, driven by `gsap.ticker` and synced to ScrollTrigger. Off under reduced motion. |
| `src/lib/motionStore.js` | Scroll position, velocity and mouse, shared with the WebGL scene without re-renders. |
| `src/webgl/InkBackground.jsx` | Fixed full-screen R3F canvas: ink-in-water shader that reacts to the cursor and scroll speed. |
| `src/hooks/useGsapContext.js` | Every animation runs inside `gsap.context()` + `gsap.matchMedia()`, with a `motion` / `reduce` branch. |
| `src/components/motion/RevealLines.jsx` | Masked line-by-line reveal (SplitText, `yPercent: 100 → 0` on scroll). |
| `src/hooks/useScramble.js`, `ScrambleText.jsx` | Text decode on viewport entry and hover. |
| `src/components/motion/HorizontalScroll.jsx` | Pinned horizontal scroll, `scrub: 1`. Native swipe strip on mobile. |
| `src/components/motion/InkReveal.jsx` | Paper veil that washes open like water where you click. |
| `src/components/Lightbox.jsx` | Full-size viewer: zoom to 100%, drag, swipe, arrow keys. |
| `src/data/works.js` | Every artwork, its alt text, titles, gallery order and the character list. |

## Adding or changing art

Images live in `public/media/`: originals in `full/`, web copies in `960/`, `1920/` and (sheets only) `2880/` as WebP.
Add the files with the same slug in each folder, add the slug to `src/data/manifest.json` (width, height, sizes) and to `src/data/works.js`.
To put a piece under paper, list its slug in that row's `reveal` in `galleryRows`.
