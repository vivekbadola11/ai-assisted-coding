# Lab 3 · Skills and rules

**Tools:** Claude Code (the rule and the skill also work in Cursor) · **Time:** about 40 minutes · **Starts at:** `t3-start`

```bash
git switch -c lab3/<your-name> t3-start   # cloned from GitHub? run `git fetch --tags` first
npm install && npm run setup && npm test     # everything green before you start
```

Topic 2 was about the right prompt. This lab is about the right **layer**: writing an
instruction once, in the place that loads it at the right time, so every session and every
teammate gets the same behaviour.

## The four layers

| Layer | Claude Code | Cursor | Loads | Use it for |
|---|---|---|---|---|
| **Project instructions** | `CLAUDE.md` (ours imports `AGENTS.md`) | `AGENTS.md` | Every session | Facts true for every task |
| **Rules** | `.claude/rules/*.md` with `paths:` | `.cursor/rules/*.mdc` with `globs:` | When a matching file is read or edited | Conventions for one part of the code |
| **Skills** | `.claude/skills/<name>/SKILL.md` | The same folder (Cursor also reads `.claude/skills/`) | Description every session; the body when the task matches, or `/name` | Procedures you repeat |
| **Permissions** | `.claude/settings.json` | Agent settings: which commands auto-run | Enforced by the tool, not read by the model | What it may run or read |

> **Claude Code asks before it writes anything in `.claude/`**, even in accept-edits mode,
> because those files change how the agent behaves. Read what it wants to write, then approve.

---

## Part A · A rule that loads only for web files

The web conventions (design tokens, `<Button>`, the typed Redux hooks) are in `AGENTS.md`, so
they load in every session, including API-only ones. They belong in a path-scoped rule.

### A1. Before

1. Open Claude Code in `shoplite/` and run `/context`. Under **Memory files** you should see
   `CLAUDE.md` and `AGENTS.md`, and nothing else from the project.

### A2. Move the rules

1. Paste **prompt 3.1**. When it asks to create `.claude/rules/web.md`, read it and approve.
2. `/diff`: two new files and one line gone from `AGENTS.md`.

### A3. Prove when it loads

1. `/clear`, then paste **prompt 3.2**.
2. For the API file it should say **none**. For the web file it should name
   **`.claude/rules/web.md`**.
3. Commit it.

**What good looks like:**
- `.claude/rules/web.md` starts with `paths: - "web/**"`, then 8–10 short bullets: colours from
  `tokens.color`, spacing from `tokens.space`, `<Button>` never a raw `<button>`, the variants,
  the typed hooks.
- It points to `docs/design-system.md` for the values, not a copy of the token table.
- `.cursor/rules/web.mdc` has the same body, with `globs: web/**` and `alwaysApply: false`.
- `AGENTS.md` lost exactly one line.

**In Cursor:** the `.mdc` file does the same job. Cursor attaches it when a file under `web/`
is in the chat. A plain `.md` file in `.cursor/rules/` is ignored, so keep the `.mdc` extension.

---

## Part B · A skill, then permissions

Adding an endpoint here always means the same four steps: a route file, registering it in
`app.ts`, a test with `startTestServer()`, and a row in `docs/api.md`. That's a procedure, so it
belongs in a skill.

### B1. Write the skill

1. `/clear`, then paste **prompt 3.3**. When it asks to create
   `.claude/skills/add-api-endpoint/SKILL.md`, read it and approve.
2. Read the skill. Is every step true for this repo? Fix anything that isn't, by hand or by
   replying.

### B2. Add the permissions

1. Copy the team permissions into the project:
   `!cp ../labs/03-skills-rules/settings.json .claude/settings.json`
2. `/permissions`: you should see the allow, ask and deny rules from `.claude/settings.json`.
   If they don't show, restart Claude Code.

### B3. Use the skill: SHOP-111

1. `/clear`, then paste **prompt 3.4**: just *"Implement @tickets/SHOP-111.md."*
2. Watch the start: it should load the **add-api-endpoint** skill on its own. (If it doesn't,
   type `/add-api-endpoint @tickets/SHOP-111.md`.)
3. `npm run test:api` should run without asking you: that's the allow rule.
4. `/diff` and read it.

### B4. Test the deny rule

1. Paste **prompt 3.5**.
2. Reading `.env` with its file tool is blocked by the deny rule. If it asks to run a shell
   command on `.env` (like `grep … .env`), pick **No**. A deny on `Read` covers the file tools;
   Topic 6 closes the shell gap.
3. Commit the skill, the settings and SHOP-111.

**What good looks like:**
- `SKILL.md` is about 30–40 lines: a description that starts *"Use when adding or changing an
  API endpoint"*, numbered steps that name real files, and a *Done when* checklist.
- SHOP-111 touches four files: `api/src/routes/categories.ts` (new), `api/src/app.ts`,
  `api/test/categories.test.ts` (new) and `docs/api.md`.
- `GET /api/categories` counts only active products and sorts by name. `npm run test:api` passes.
- The agent should mention a decision the ticket leaves open: what to do with a category that
  has no active products.

**What we saw in rehearsal:** with only the one-line prompt, the agent loaded the skill as its
first step, followed the wishlist route as the pattern, wrote three tests and updated
`docs/api.md`. Your code will differ in the details; check the four files and the test run.

**In Cursor:** Cursor also loads skills from `.claude/skills/`, so the same skill shows up there.
Type `/add-api-endpoint` in Agent chat, or let it pick the skill from the description.

---

## Anti-patterns to avoid

- A 500-line `CLAUDE.md`: every line loads in every session
- A rule that copies the docs: it drifts. Point to them instead
- A skill with a vague description: it never loads
- "Never read `.env`" as an instruction: make it a deny rule
- Personal preferences committed to the repo: keep them in `~/.claude/` or `.claude/settings.local.json`
- Rules and skills nobody reviews: they change every session, so review them in PRs like code
