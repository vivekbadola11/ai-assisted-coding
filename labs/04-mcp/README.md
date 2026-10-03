# Lab 4 · MCPs and plugins (outline)

> **Status: outline.** The full lab sheet and prompts are written with the Topic 4 recording.

**Tools:** Claude Code and Cursor · **Starts at:** `t4-start`

## Goal

Let the agent fetch facts from the systems where they live, instead of guessing
or relying on what you paste.

## Assets already in the repo

- `api/data/shoplite.db`: a real SQLite database (after `npm run setup`) with products,
  synthetic customers, 300 orders and open carts
- `tickets/`: tickets you can import into GitHub Issues, Jira or Linear
- SHOP-109: "who is affected?" can only be answered from the database

## Planned exercises

1. **Database MCP, read-only.** Connect a SQLite MCP server to `api/data/shoplite.db` in both tools
   (Claude Code: `claude mcp add` and `/mcp`; Cursor: MCP settings / `.cursor/mcp.json`).
   Ask: *"Which open carts contain a discontinued product?"* (this answers SHOP-109's "who").
2. **Issue tracker MCP.** Import `tickets/` into your tracker, connect its MCP server, and run
   Lab 2's SHOP-113 prompt (2.2) with the ticket fetched by MCP instead of `@tickets/...`.
3. **Scope it down.** Read-only DB user, project-scoped config committed to the repo, and
   what to do when a tool asks for more access than it needs.
4. **Plugins.** Install a plugin that bundles skills + MCP config, inspect what it adds.
