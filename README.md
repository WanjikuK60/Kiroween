# The Haunted Portfolio

Kiroween 2026 entry, **Costume Contest** category.

Live site: https://wanjikuk60.github.io/Kiroween/

A dark, spooky portfolio site. Switch on the lantern to explore it by the light of a flickering flame that follows your cursor (or finger). Each section is a room in a haunted house:

| Room | What's inside |
| --- | --- |
| The Library | About me |
| The Clock Tower | A timeline of what I built, month by month |
| The Cellar | Projects as haunted portraits that flip to reveal details, with potion filters (Python, JavaScript, TypeScript, AI) |
| The Spellbook | What I'm learning, brewing in a bubbling cauldron |
| The Attic | Skills |
| The Summoning Circle | **Build your own haunted portfolio**: fill in a form, watch a live preview, then download it as one HTML file or **deploy it to your own GitHub Pages** in one click. See the [live example](https://wanjikuk60.github.io/Kiroween/demo/) |
| The Séance | Contact |

## Features
- Lantern that follows the cursor or your finger, with flicker. It starts off; switch it on for the full haunted darkness.
- **Lights on** mode: a readable parchment theme that turns off the darkness and fog. Remembered between visits.
- **Ghost hunt**: three ghosts hide in the rooms. Find them all to unlock a secret message.
- **Portfolio builder**: everything typed into the form is escaped, and only `http(s)` links are kept, so a pasted `javascript:` link can't run.
- Drifting fog on a canvas layer, plus an occasional ghost flyby.
- Wind ambience synthesized with WebAudio, with no audio files. It is on by default and starts at your first click, tap or key press (browsers don't allow sound before that). Turn it off once and it stays off.
- Rooms fade in as you scroll to them.
- Accessible: skip link, room map, keyboard focus styles, `aria-pressed` toggles, a focus-managed secret dialog (Escape closes it), and `prefers-reduced-motion` support that disables animation.

## One-click deploy to GitHub Pages

The **🚀 Deploy to my GitHub Pages** button publishes a visitor's portfolio to their own account:

1. A sign-in window asks GitHub for permission (`public_repo` scope). The small helper in [`server/`](server/) holds the OAuth app's secret, swaps GitHub's one-time code for an access token, and passes it back to this page with `postMessage`, only to `ALLOWED_ORIGIN`.
2. [`deploy.js`](deploy.js) uses the GitHub API from the browser: it creates the repository (or updates one it made earlier), uploads `index.html`, turns on GitHub Pages and waits for the first build.
3. The token is handed back to GitHub (revoked) as soon as the deploy finishes. Nothing is stored.

It never overwrites a repository it didn't create: repos are marked by their description, and an existing repo with the same name stops the deploy.

### Running the helper
- **Render (free):** `render.yaml` is a Blueprint. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from a GitHub OAuth app whose callback URL is `https://<your-service>.onrender.com/auth/callback`.
- **Locally:** `cd server && pip install -r requirements.txt -r requirements-dev.txt && pytest` (11 tests), then `uvicorn app:app --reload`.
- If you fork this, change `DEPLOY_API` in `deploy.js` and `ALLOWED_ORIGIN` in `render.yaml` to your own addresses.

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
