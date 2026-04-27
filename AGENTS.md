# Agent Instructions

## Project Type
This is a **Claude Code plugin** (not a Node.js app). No `package.json`, no build step.

## Package Manager
Use **pnpm** for any Node.js package operations.

## Plugin Structure
| Path | Purpose |
|------|---------|
| `.mcp.json` | MCP server configuration |
| `skills/*/SKILL.md` | Skill definitions |
| `scripts/*.js` | Utility scripts |
| `data/*.md` | Persisted data |

## Bash Commands
**Avoid compound commands** (`cd path && git status`). Each `cd` triggers a permission prompt on Windows.
