# Kiroween 2026 submission drafts

Category: **Costume Contest**
Bonus prizes to consider: Best Demo (automatic), Social Blitz, Bonus Blog. Add Student only if every team member qualifies.

Replace every `<...>` placeholder before submitting.

## Devpost description

**The Haunted Portfolio** is a portfolio site you explore with a lantern. The page is dark. A flickering circle of light follows your cursor, or your finger on a phone, and the content appears only where you point it.

Each section is a room in a haunted house:
- **The Library (About):** who I am.
- **The Cellar (Projects):** six projects, from a Twitch chat mapper to an event check-in kiosk and a library catalog API.
- **The Attic (Skills):** the tools I work with.
- **The Séance (Contact):** how to reach me.

The spooky effects are there to help you read the page:
- The lantern makes you move through the page and discover each room.
- Fog drifts behind the text and a ghost floats past now and then.
- Wind sound is generated in the browser with WebAudio. It uses no audio files and stays off until you click the Wind button.
- Rooms fade in as you scroll to them.

Readability and accessibility come first:
- A button turns the darkness off.
- A skip link and visible keyboard focus support keyboard use.
- Animations are disabled when the visitor's system asks for reduced motion.
- On touch devices the darkness is lighter.

It is plain HTML, CSS and JavaScript with no build step and no dependencies.

Live app: <GitHub Pages URL>
Source: <GitHub repo URL>

## Demo video script (about 2:30)

| Time | On screen | Say |
|---|---|---|
| 0:00-0:15 | Open the live site. The hero title flickers. | "This is my portfolio, and it is haunted. It's my Costume Contest entry for Kiroween 2026." |
| 0:15-0:40 | Move the lantern around the hero. | "The page is dark. The only way to read it is with this lantern, which follows my cursor on desktop and my finger on mobile." |
| 0:40-1:10 | Scroll to the Library and the Cellar. Hover over the project cards. | "Each section is a room. The Cellar holds my projects. Cards glow and tilt when you hover or focus them." |
| 1:10-1:30 | Click the Wind button. | "Wind ambience is generated in the browser with WebAudio. There are no audio files, and it is off until you opt in." |
| 1:30-1:50 | Wait for the ghost flyby. Click Lantern: off. | "Spooky shouldn't mean unreadable. One click turns the darkness off." |
| 1:50-2:05 | Turn on reduced motion in system settings and reload, or show the CSS rule. | "If the system asks for reduced motion, the animations stop. Keyboard focus is always visible." |
| 2:05-2:30 | Show the `.kiro` folder in the editor: spec, steering, hook. | "I built it with Kiro. A spec defined the lantern, rooms and accessibility rules. A steering doc kept the style consistent. A hook checks accessibility on every save." |

Recording tips: keep it under 3 minutes, record on the device you built it on, and use no copyrighted music. Upload to YouTube as public.

## Social post (Social Blitz)

Starts with the hashtag, as the rules require:

> #KiroweenHackathon26 I built a haunted portfolio you explore with a lantern, using @Kiro. My favorite part: writing the spec first meant the spooky effects had clear accessibility rules from the start. <repo or demo URL>

Edit the second sentence so it is true for you. The rules ask for your favorite thing about Kiro.

## Blog outline (Bonus Blog)

The post must say it was written as part of the Kiroween 2026 hackathon.
1. Why a haunted portfolio.
2. Writing the spec: requirements, design, tasks.
3. Steering and the accessibility hook.
4. Building the lantern with a CSS radial gradient.
5. What I would do next.
