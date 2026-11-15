# Design

- `index.html`: semantic structure with a fixed `canvas#fog`, a fixed `div#darkness`, hero, `main` with four `section.room` elements, and footer.
- `styles.css`: `#darkness` uses a `radial-gradient` centered on CSS variables `--x`, `--y` with radius `--r`. `script.js` updates these variables.
- `script.js`: pointer tracking, radius flicker via `setInterval`, `IntersectionObserver` for room reveal, canvas fog loop, ghost flyby timer, WebAudio filtered noise with an LFO for wind.
- Reduced motion: checked once via `matchMedia`; CSS media query disables keyframes.
