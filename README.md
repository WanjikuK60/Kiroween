# The Haunted Portfolio

Kiroween 2026 entry, **Costume Contest** category.

A portfolio site where the page is dark and you explore it with a flickering lantern that follows your cursor (or finger). Each section is a room in a haunted house: Library (about), Cellar (projects), Attic (skills) and Séance (contact).

## Features
- Lantern cursor with flicker, toggleable for readability.
- Drifting fog on a canvas layer, plus an occasional ghost flyby.
- Wind ambience synthesized with WebAudio. It is off by default and needs no audio files.
- Rooms fade in as you scroll to them.
- Accessible: skip link, keyboard focus styles, `aria-pressed` toggles, and `prefers-reduced-motion` support that disables animation.

## Run it
No build step. Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Customize
Edit the text in `index.html` (name, projects, skills, links). Colors live in the `:root` block of `styles.css`.

## Deploy
Enable GitHub Pages on the `main` branch (root folder) for a public URL.

## Built with Kiro
See [KIRO_WRITEUP.md](KIRO_WRITEUP.md) and the `.kiro/` directory (spec, steering, hooks).

## License
MIT
