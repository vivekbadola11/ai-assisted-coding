# Labs

One folder per topic in the series. Each has a lab sheet (`README.md`) and the
prompts to paste (`prompts.md`).

Keep this `labs/` folder **next to** the `shoplite/` folder, and open only `shoplite/` in
Claude Code or Cursor. Some labs include checks (like `02-prompting/check-shop-113.mts`)
that the agent mustn't read. Run them from inside `shoplite/` as `../labs/...`.

| # | Topic | Tools | Starts at | Uses |
|---|---|---|---|---|
| 1 | [Installation, setup & daily use](01-setup/) | Claude Code + Cursor | `t1-start` | `.env`, `/init`, basic commands |
| 2 | [Prompt engineering](02-prompting/) | Claude Code | `t2-start` | SHOP-113, SHOP-101 … 105, 112 |
| 3 | [Skills and rules](03-skills-rules/) | Both | `t3-start`* | SHOP-100, SHOP-111, `docs/design-system.md` |
| 4 | [MCPs and plugins](04-mcp/) | Both | `t4-start`* | SQLite DB, tickets |
| 5 | [Token optimisation & context](05-context/) | Both | `t5-start`* | SHOP-106, `logs/app.log` |
| 6 | [Security, secrets & PII](06-security/) | Both | `t6-start`* | `.env`, customers, SHOP-107 |
| 7 | [Subagents](07-subagents/) | Claude Code | `t7-start`* | SHOP-108, 109, 110 |

\* Tags for topics 3–7 are added when those labs are recorded.

## Ground rules for every lab

1. **Work on a branch.** `git switch -c lab<N>/<your-name>` before you start.
2. **Commit before you hand the agent a task.** Then `git diff` shows exactly what it changed.
3. **Read every diff.** You should be able to defend every line in a review as if you wrote it.
4. **AI output varies.** Your agent won't say exactly what the presenter's did. Compare the
   *shape* of the result with "What good looks like" in each lab.
5. **Reset when you need to:** `git restore . && git clean -fd` (careful: discards your changes),
   or `git switch -c retry <tag>`.
