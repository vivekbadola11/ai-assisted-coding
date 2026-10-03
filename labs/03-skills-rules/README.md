# Lab 3 · Skills and rules (outline)

> **Status: outline.** The full lab sheet and prompts are written with the Topic 3 recording.
> Everything this lab needs is already in the repo.

**Tools:** Claude Code and Cursor · **Starts at:** `t3-start` (= `t2-end`)

## Goal

Move from "the right prompt" to "the right instruction in the right layer", so the
whole team gets the same behaviour without remembering the same prompts.

## Assets already in the repo

- `AGENTS.md` / `CLAUDE.md` from Lab 1
- `docs/architecture.md`: conventions worth turning into rules
- `docs/design-system.md`: web-only rules (good for a path-scoped rule)
- `api/src/db/migrations/`: a repeatable procedure (good for a skill)
- SHOP-100 (health endpoint) and SHOP-111 (categories endpoint): tasks to run through a new skill

## Planned exercises

1. **Sort the layers.** Take the Lab 1 `AGENTS.md` and decide line by line: always-on
   (AGENTS.md / CLAUDE.md), path-scoped rule, skill, or permission.
2. **Path-scoped rule for `web/**`.** Claude Code: `.claude/rules/web.md` with `paths`.
   Cursor: `.cursor/rules/web.mdc` with `globs`. Prove it loads only when a web file is touched.
3. **Write a skill: `add-api-endpoint`.** Route file → register in `app.ts` → test with
   `api/test/helpers.ts` → update `docs/api.md`. Use it to build SHOP-100 and SHOP-111.
4. **Write a skill: `new-migration`.** Numbered file, never edit shipped migrations,
   `npm run setup -- --reset` to verify.
5. **Permissions preview.** `.claude/settings.json`: allow `npm run test:api`, ask for `git push`.
6. **Read a real skills library:** Superpowers (github.com/obra/superpowers).
