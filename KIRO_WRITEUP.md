# How Kiro was used

This write-up lists only what is in this repository and what happened in the build session.

## Kiro app
Built in the **Kiro IDE**, in one agent chat session. I did not try the CLI, Web or Crew, so I cannot compare them.

## What was built with Kiro
I asked for a haunted portfolio for the Costume Contest category and answered the agent's scoping questions (category, content, stack, look). I chose "go with defaults", so the agent built a plain HTML/CSS/JS site with a lantern cursor. I then had the agent fill in the real content from my public GitHub profile and repos.

## Spec-driven development
`.kiro/specs/haunted-portfolio/` contains `requirements.md` (user stories with WHEN/SHALL acceptance criteria), `design.md` and `tasks.md`. The requirements cover the lantern, the rooms, the atmosphere and accessibility.

Honest comparison with vibe coding: the agent wrote the spec files in the same pass as the code, so the site was not generated task by task from the spec. The spec documents the scope and the accessibility rules, and `tasks.md` tracks what is finished. **[confirm]** Add your own view of whether the spec helped.

## Steering
`.kiro/steering/product.md` records the stack (no build step, no dependencies), the palette and fonts, the rule that every effect must serve usability, and the ban on copyrighted audio and images. It stays in context for each request.

## Hooks
`.kiro/hooks/a11y-check-on-save.json` runs on saving a `.css`, `.js` or `.html` file. It tells the agent to check reduced-motion support, visible keyboard focus and readable text with the lantern off. It was created after the code existed and became active in a later session, so it did not shape the first build. **[confirm]** Add what it caught, if anything.

## Not used
Custom agents, MCP servers, Kiro powers, workflows and property-based testing. I did not use them, so nothing is claimed here.

## Other tooling
The agent looked up my public GitHub profile and repo READMEs through web fetch to write the projects section.
