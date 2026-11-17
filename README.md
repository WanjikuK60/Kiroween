# The Haunted Portfolio

Kiroween 2026 entry, **Costume Contest** category.

Live site: https://wanjikuk60.github.io/Kiroween/

A portfolio site where the page is dark and you explore it with a flickering lantern that follows your cursor (or finger). Each section is a room in a haunted house:

| Room | What's inside |
| --- | --- |
| The Library | About me |
| The Clock Tower | A timeline of what I built, month by month |
| The Cellar | Projects as haunted portraits that flip to reveal details, with potion filters (Python, JavaScript, TypeScript, AI) |
| The Spellbook | What I'm learning, brewing in a bubbling cauldron |
| The Attic | Skills |
| The Summoning Circle | **Build your own haunted portfolio**: fill in a form, watch a live preview, and download a single HTML file you can host anywhere |
| The Séance | Contact |

## Features
- Lantern that follows the cursor or your finger, with flicker. It can be toggled off.
- **Lights on** mode: a readable parchment theme that turns off the darkness and fog. Remembered between visits.
- **Ghost hunt**: three ghosts hide in the rooms. Find them all to unlock a secret message.
- **Portfolio builder**: everything typed into the form is escaped, and only `http(s)` links are kept, so a pasted `javascript:` link can't run.
- Drifting fog on a canvas layer, plus an occasional ghost flyby.
- Wind ambience synthesized with WebAudio. It is off by default and needs no audio files.
- Rooms fade in as you scroll to them.
- Accessible: skip link, room map, keyboard focus styles, `aria-pressed` toggles, a focus-managed secret dialog (Escape closes it), and `prefers-reduced-motion` support that disables animation.

## Run it
No build step. Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Customize
Edit the text in `index.html` (name, timeline, projects, skills, links). The builder lives in `builder.js`. Colors live in the `:root` block of `styles.css`.

## Deploy
The site is deployed with GitHub Pages from the `main` branch (root folder).

## Built with Kiro
See [KIRO_WRITEUP.md](KIRO_WRITEUP.md) and the `.kiro/` directory (spec, steering, hooks).

## License
MIT
