# Lab 1 prompts

## 1.1 · Sanity check (read-only)

```
I just cloned this repo. Check whether my machine can run it.

1. Explain in 5 bullets what this project is and how it is organised.
2. Find the required tool versions (Node, npm) and compare them with what I have installed.
3. Run the setup and test commands described in the README.
4. Report anything that fails, the root cause, and the fix you recommend.

Don't edit any tracked files. Installing dependencies and running the setup script are fine.
If something needs to change outside this folder (for example installing a different Node version), tell me instead of doing it.
```

## 1.2 · Fix the setup problem

```
Fix the TAX_RATE problem you found.
- The value must come from docs/business-rules.md, not a guess.
- Add it to .env.example with a one-line comment, and to my local .env.
- Don't change any code.
Then run npm test and show me the summary.
```

## 1.3 · Trim the generated CLAUDE.md

```
Review CLAUDE.md as if you were a new engineer joining tomorrow.
Keep: exact commands (including how to run a single test file), a short repo map,
conventions that are NOT obvious from the code, and pointers into docs/.
Remove: generic advice, anything duplicated from README, anything you can't verify in the repo.
Keep it under 60 lines. Show me the diff before writing.
```

## 1.4 · One context file for both tools

```
Cursor reads AGENTS.md and Claude Code reads CLAUDE.md.
Move the project instructions from CLAUDE.md into a new AGENTS.md at the repo root.
Then make CLAUDE.md contain only:
  @AGENTS.md
plus any notes that only matter to Claude Code (there may be none).
```

## 1.5 · A tiny edit to check and undo

```
Add an @example line to the JSDoc comment of roundMoney() in
@api/src/lib/money.ts showing that roundMoney(161.676) returns 161.68.
Change nothing else.
```
