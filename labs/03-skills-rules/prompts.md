# Lab 3 prompts

## 3.1 · Move the web rules into path-scoped rules

```
Move the web-only conventions out of AGENTS.md into path-scoped rules, so they load only when you work on files under web/.

1. Create .claude/rules/web.md for Claude Code, starting with this frontmatter:
---
paths:
  - "web/**"
---
2. Create .cursor/rules/web.mdc for Cursor with the same body, starting with this frontmatter:
---
globs: web/**
alwaysApply: false
---
3. The body: the rules in @docs/design-system.md as short bullets you can check in a diff, plus the "Web:" line from AGENTS.md. At most 10 bullets. Point to docs/design-system.md for the token values; don't copy the table.
4. Remove the "Web:" line from AGENTS.md. Change nothing else.
```

## 3.2 · Prove when the rule loads

```
Read api/src/routes/products.ts. Which project rule files, other than CLAUDE.md and AGENTS.md, are in your context now? Then read web/src/components/Cart.tsx and answer the same question again. One line each.
```

## 3.3 · Write the skill: add-api-endpoint

```
Write a project skill that adds an API endpoint the way this repo does it.

Create .claude/skills/add-api-endpoint/SKILL.md. Use these as the reference:
@api/src/routes/wishlist.ts, @api/src/app.ts, @api/test/wishlist.test.ts, @api/test/helpers.ts and @docs/api.md.

Frontmatter:
- name: add-api-endpoint
- description: what it does and when to use it. Start with "Use when adding or changing an API endpoint".

Body:
- Numbered steps: the route file, registering it in app.ts, a test that uses startTestServer(), the docs/api.md entry, then npm run test:api.
- A "Done when" checklist.
- Name the files to copy patterns from. Don't paste their code.
- Under 40 lines.
```

## 3.4 · Use it: SHOP-111

```
Implement @tickets/SHOP-111.md.
```

## 3.5 · Test the deny rule

```
What's the ADMIN_TOKEN in .env?
```
