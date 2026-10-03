# Lab 1 · Installation, setup & daily use

**Tools:** Claude Code and Cursor · **Time:** about 60 minutes · **Starts at:** `t1-start` (`main`)

By the end you will have both tools installed and signed in, ShopLite running,
a project context file that both tools read, and you will have used every
everyday agent command once.

## Before you start

- A paid Claude plan (Pro, Max, Team or Enterprise) or a Claude Console account.
  The free claude.ai plan does not include Claude Code.
- A Cursor account.
- Git, and a terminal you're comfortable in.
- Node.js: don't fix this yet. Part B finds out whether yours is new enough.

---

## Part A · Install both tools

### A1. Claude Code

| System | Command |
|---|---|
| macOS, Linux, WSL | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |
| Windows CMD | `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` |
| Homebrew (alternative) | `brew install --cask claude-code` |
| WinGet (alternative) | `winget install Anthropic.ClaudeCode` |

Open a **new** terminal, then:

```bash
claude --version     # prints a version number
claude doctor        # install health, settings problems, update status
claude               # first run opens the browser to sign in
```

Inside the session, run `/status` and check the account and model.
Type `/exit` (or press Ctrl+D twice) to leave.

> **Windows:** install [Git for Windows](https://git-scm.com/downloads/win) so Claude Code
> can use Bash. If you want sandboxed commands, run Claude Code inside WSL 2 instead.
> The native installer updates itself. Homebrew and WinGet installs need a manual upgrade.

### A2. Cursor

1. Download from cursor.com and install.
2. On first run, accept **Import VS Code settings and extensions** if you use VS Code.
3. Sign in.
4. Open **Cursor Settings** and check **Privacy Mode** against your company's policy.

### A3. Optional: Claude Code inside Cursor

In Cursor: Extensions → search **Claude Code** (publisher: Anthropic) → Install. Or run
`claude` in Cursor's terminal, then `/ide` to connect it to the editor.

✅ **Checkpoint:** `claude --version` and `claude doctor` work, `/status` shows your account,
and Cursor is signed in.

---

## Part B · First session: let the agent check your setup

### B1. Get the repo

Clone the course repo, or unzip `AI_Assisted_Coding_course.zip`. Either way you get an
`ai-assisted-coding/` folder with `shoplite/` and this `labs/` folder side by side.

```bash
git clone https://github.com/vivekbadola11/ai-assisted-coding.git
cd ai-assisted-coding/shoplite
```

**Don't run `npm install` yet.** Let the agent find what's wrong.

### B2. Claude Code: sanity check with every action approved by you

1. Run `claude` in the `shoplite` folder. Accept the **trust this folder** prompt.
2. Look at the status bar under the prompt. New sessions usually start in **auto mode**
   (a safety classifier approves actions for you). Press **Shift+Tab** until it shows
   **⏸ manual mode on**. Now Claude asks before every edit and every command.
3. Paste **prompt 1.1** from [prompts.md](prompts.md).
4. For each request (`node --version`, `npm install`, `npm run setup`, `npm test`), read the
   command before you approve it. Choose the "don't ask again" option only for commands
   you'd be happy to see run a hundred times.

| Mode (Shift+Tab cycles) | What runs without asking |
|---|---|
| ⏸ manual | Reads only. Asks before edits and commands |
| ⏵⏵ accept edits | Reads and file edits. Still asks before most commands |
| ⏸ plan | Reads and explores, writes a plan. No edits until you approve the plan |
| ⏵⏵ auto | Everything, with a classifier checking each action in the background |

### B3. Cursor: same prompt

1. **File → Open Folder** → `shoplite`. Wait for indexing to finish.
   If Cursor asks whether to open the Git repository it found in a parent folder, choose
   **Yes** (or **Always**). The repo root is `ai-assisted-coding/`, one level up.
2. Open the agent with **Ctrl/Cmd+I** in **Agent** mode and paste prompt 1.1.
   When it wants to run a terminal command it asks first. Read the command before you
   accept it.
3. Compare: what did each tool check, and how did each report it?

**What good looks like:**
- Node older than 22.18: `npm install` fails with `EBADENGINE` (the repo sets
  `engine-strict`). Fix: install Node 22 (`nvm install 22`, or nvm-windows, or nodejs.org),
  then run `npm install` again.
- `npm run setup` works, but `npm test` fails: `Missing required environment variable TAX_RATE`.
- It traces the value to `docs/business-rules.md` (GST is 18%) and points out that
  `.env.example` is missing the variable.

### B4. Fix it with the agent (still in manual mode)

Back in Claude Code, paste **prompt 1.2**.
Approve each edit only after reading it. Then run `npm test` yourself: all tests pass.

> 💬 **Discuss:** the agent just read and edited your `.env`. Here it only holds fake
> values. In Topic 6 we'll stop agents from reading it at all.

### B5. Models and effort

- Claude Code: `/model` to switch model, `/effort` to set how hard it thinks.
- Cursor: the model picker under the chat box (Ctrl/Cmd+Alt+/).
- Rule of thumb: the fastest model for small, clear edits; the strongest model with
  more effort for investigation, planning and anything you'll find hard to review.

---

## Part C · Project context: one file, both tools

Every session starts with no memory of your project. Context files fix that.

| File | Read by | Use it for |
|---|---|---|
| `AGENTS.md` | Cursor, Claude Code | Shared project instructions (one source of truth) |
| `CLAUDE.md` | Claude Code | Claude-only additions; can import `@AGENTS.md` |
| `.cursor/rules/*.mdc` | Cursor | Scoped rules (Topic 3) |
| `~/.claude/CLAUDE.md`, Cursor User Rules | You only | Personal preferences across projects |

### C1. Generate a first draft

In Claude Code run `/init`. It reads the repo and writes `CLAUDE.md`.

### C2. Trim it

Paste **prompt 1.3**, or edit it yourself. Keep only what a new teammate needs:
- the commands (setup, dev, test, single test file, typecheck)
- a short repo map
- the conventions that aren't obvious from the code (TypeScript run by Node, migrations,
  money rounding, design tokens)
- "where to look first" pointers to `docs/`

Delete anything generic ("write clean code") or wrong. Aim for under 60 lines.

### C3. Share it with Cursor

Paste **prompt 1.4**. Result: the shared content lives in `AGENTS.md`, and `CLAUDE.md`
holds `@AGENTS.md` plus anything Claude-specific.

### C4. Prove both tools read it

- Claude Code: `/clear`, then ask *"How do I run only the API tests?"* → `npm run test:api`.
- Cursor: new chat (Ctrl/Cmd+N), same question.
- Claude Code: `/memory` shows which instruction files are loaded and opens them for editing.

Commit: `git add AGENTS.md CLAUDE.md .env.example && git commit -m "Add project context; document TAX_RATE"`

---

## Part D · Basic commands lab

Use every everyday command once, on a tiny edit that is safe to throw away.

```bash
git switch -c lab1/commands
```

### D1. Claude Code

Run `claude` in the `shoplite` folder.

1. **@ a file, and Esc.** `/clear`, then: *"Explain @api/src/lib/money.ts"*. While it is
   answering, press **Esc** and redirect it: *"3 bullets only."*
2. **! a command.** `!npm run test:api`, then: *"Summarise that test output in one line."*
3. **Plan mode.** `/plan add a GET /api/health endpoint`. Read the plan, then decline it.
   No files change. (Shift+Tab also cycles manual → accept edits → plan → auto.)
4. **Edit, then check.** Shift+Tab to **⏸ manual mode**, paste **prompt 1.5** and approve the
   edit. Then `/diff` to see the change and `/review` for a review of it.
5. **Undo.** Press **Esc Esc** (or `/rewind`), pick the point before the edit and restore the
   code. `!git diff` now shows nothing.
6. **The conversation.** `/btw which file sets the tax rate?` (a side question that stays out
   of the conversation), then `/context`, `/compact`, `/model`, `/effort` and `/usage`.
   Finish with `/clear`.

### D2. Cursor

Open the `shoplite` folder in Cursor.

1. **Ask mode.** Ctrl/Cmd+I, switch to **Ask**: *"Explain @money.ts in 3 bullets."*
2. **Plan mode.** Switch to **Plan**: *"Add a GET /api/health endpoint."* Read the plan; don't build it.
3. **Agent mode.** New chat (Ctrl/Cmd+N), switch to **Agent**, paste **prompt 1.5**. Reject the change
   (Ctrl/Cmd+Shift+Backspace), run it again, then accept it (Ctrl/Cmd+Enter).
4. **Review and undo.** *"Review @Commit for anything risky"*, then restore the **checkpoint** from
   before the edit.
5. **Inline edit and selection.** Select `roundMoney`, press **Ctrl/Cmd+K**: *"add a second example
   to the comment"*. Then **Ctrl/Cmd+Shift+L** and ask a question about the selection.
6. **Terminal and side chat.** Run `npm run test:api` in Cursor's terminal and ask *"Summarise
   @Terminals"*. Ask a side question with `/btw`.

When you're done: `git restore .` to leave the repo clean.

> **Bonus: one-shot mode.** Filter first, then hand the agent only what matters:
> `grep '"level":"error"' logs/app.log | claude -p "Group these errors by cause. 3 bullets max."`
> (PowerShell: `Select-String '"level":"error"' logs/app.log | claude -p "..."`)

---

## Cheat sheet

| I want to… | Claude Code | Cursor |
|---|---|---|
| Fresh context for a new task | `/clear` | New chat (Ctrl/Cmd+N) |
| Approve every action | Shift+Tab → manual | Agent mode, ask before running commands |
| Questions only, no edits | Shift+Tab → plan | Mode menu → Ask |
| Plan first | Shift+Tab → plan, or `/plan <task>` | Mode menu → Plan |
| Point at a file | `@path/to/file` | `@` → pick file |
| Feed it command output | `!npm test` | `@Terminals` |
| Stop it | Esc | Stop button |
| Review what it changed | `/diff`, `/review` | Diff view, `@Commit` |
| Undo | Esc Esc / `/rewind` | Checkpoint → Restore |
| Side question | `/btw` | `/btw` |
| Long session | `/context`, `/compact` | Context indicator, new chat |
| Switch model | `/model`, `/effort` | Model picker (Ctrl/Cmd+Alt+/) |
| Cost and limits | `/usage` | Cursor Settings |
| Project instructions | `/init`, `/memory`, `CLAUDE.md` | `AGENTS.md`, `/create-rule` |
