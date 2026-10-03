# Lab 5 · Token optimisation and context management (outline)

> **Status: outline.** The full lab sheet and prompts are written with the Topic 5 recording.

**Tools:** Claude Code and Cursor · **Starts at:** `t5-start`

## Goal

Get the right information into the context at the right time, and keep noise out.

## Assets already in the repo

- **SHOP-106:** the cart re-renders on every keystroke. Root cause is in
  `web/src/store/cartSlice.ts` (`selectCartView` builds a new object on every call;
  `searchQuery` lives in the cart slice). The dev-only "renders: N" badge in the cart makes it visible.
- **`logs/app.log`:** ~3,000 lines (~375 KB). Far too big to paste.
- `npm test` output: verbose by default.

## Planned exercises

1. **Paste vs point.** Ask about SHOP-106 by pasting the whole store folder, then by
   `@web/src/store/cartSlice.ts` + one sentence. Compare `/context` after each.
2. **Filter before you feed.** `grep` / `Select-String` the log first, or let a subagent read it (Lab 7).
3. **Built-in commands.** `/context`, `/compact <focus>`, `/clear` between tasks, `/usage`.
   Cursor: the context indicator and starting a new chat.
4. **Quieter tools.** Run tests with a terser reporter
   (`node --test --test-reporter=dot test/*.test.ts`), and look at a command-output compressor
   such as RTK (github.com/rtk-ai/rtk).
