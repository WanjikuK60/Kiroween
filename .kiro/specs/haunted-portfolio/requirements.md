# Requirements

## 1. Lantern exploration
**User story:** As a visitor, I want a lantern that follows my pointer so that I discover content by exploring.
- WHEN the pointer moves THEN the lit circle SHALL follow it.
- WHEN the visitor presses the lantern toggle THEN the darkness layer SHALL be removed or restored.
- WHILE the device has no hover support THE darkness SHALL be lighter so text stays readable.

## 2. Rooms
**User story:** As a visitor, I want themed sections so I can read about the owner.
- The page SHALL contain About, Projects, Skills and Contact rooms.
- WHEN a room scrolls into view THEN it SHALL fade in.

## 3. Atmosphere
- The page SHALL show drifting fog and an occasional ghost flyby.
- Wind sound SHALL be off by default and only start after a user click.

## 4. Accessibility
- WHEN `prefers-reduced-motion` is set THEN animations SHALL be disabled.
- All controls SHALL be keyboard operable with visible focus.
