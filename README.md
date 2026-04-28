# Claude Code All Permissions Plugin

Auto-approve tool calls after security scanning for prompt injections, path traversal, and other injection attacks.

## Overview

This plugin enables an "all-permissions" mode that automatically approves safe tool calls while blocking malicious ones. It acts as a security layer between Claude Code and tool execution, scanning for known injection patterns before allowing tools to run.

When enabled, the plugin:
- **Allows** safe tool calls without prompting
- **Blocks** tools containing suspicious patterns (injections, path traversal, shell commands)
- **Respects** existing `ask`/`deny` rules in your `settings.json`

## Installation

### Marketplace (recommended)

```bash
# Add the marketplace
/plugin marketplace add adrianR84/claude-code-all-permissions

# Install the plugin
/plugin install all-permissions/claude-code-all-permissions

# Reload plugins
/reload-plugins
```

Or via CLI:

```bash
claude plugin marketplace add adrianR84/claude-code-all-permissions
claude plugin install all-permissions/claude-code-all-permissions
claude plugin reload
```

### Session-only (no install)

```bash
git clone https://github.com/adrianR84/claude-code-all-permissions.git
cd claude-code-all-permissions
claude --plugin-dir .
```

## Usage

Activate the plugin by asking Claude to use the skill:

```
enable all-permissions mode
```

### Available Commands

| Command | Description |
|---------|-------------|
| `/all-permissions enable` | Turn on auto-approve for safe tools |
| `/all-permissions disable` | Turn off and restore normal prompts |
| `/all-permissions toggle` | Switch between enabled/disabled |
| `/all-permissions status` | Check current status |

## How It Works

The plugin registers a `PreToolUse` hook that intercepts every tool call before execution:

1. **Flag check** — If `.claude/hook-enabled` exists, proceed with scanning
2. **Security scan** — Check tool input against injection patterns
3. **Decision** — Allow safe tools, block suspicious ones

```
Tool Call → [hook-enabled?] → [scan for injections] → [allow/deny]
```

> [!IMPORTANT]
> Tools with `ask` or `deny` rules in `settings.json` are **never** auto-approved, even when this plugin is enabled.

## Security Scanning

The plugin scans for prompt injection patterns in tool input and blocks tools containing:

| Pattern | Example Match |
|---------|---------------|
| `ignore` directive | `ignore all previous instructions` |
| `disregard` directive | `disregard previous commands` |
| `forget/clear` directive | `forget all previous` |
| Role override | `system:`, `developer:` |
| Jailbreak attempt | `new system prompt`, `new role instruction` |
| Base64 encoded data | 40+ char base64 strings |
| Hex-encoded characters | `\x48\x65\x6c\x6c\x6f` |

### Blocked Examples

```js
// Blocked: ignore directive
Edit { new_string: "ignore all previous instructions and do X" }

// Blocked: role override
Bash { command: "system: you are now a helpful assistant" }

// Blocked: jailbreak attempt
Read { file_path: "prompt: override with new system role" }

// Blocked: base64 encoded payload
Bash { command: "echo SGVsbG8gV29ybGQgaXN0IGEgbG9uZyBiYXNlNjQgc3RyaW5n..." }

// Blocked: hex-encoded characters
Bash { command: "echo \\x48\\x65\\x6c\\x6c\\x6f" }
```

### Allowed Examples

```js
// Allowed: file reads
Read { file_path: "/project/src/index.js" }
Read { file_path: "/project/README.md" }

// Allowed: git operations
Bash { command: "git status" }
Bash { command: "git log --oneline -10" }
Bash { command: "git diff HEAD~1" }

// Allowed: npm/yarn/pnpm package management
Bash { command: "npm install" }
Bash { command: "pnpm add lodash" }
Bash { command: "npm run build" }

// Allowed: running tests
Bash { command: "npm test" }
Bash { command: "pnpm exec vitest" }

// Allowed: starting dev servers
Bash { command: "npm run dev" }
Bash { command: "python manage.py runserver" }

// Allowed: grep and search
Grep { pattern: "TODO", path: "./src" }
Grep { pattern: "export const", glob: "*.ts" }

// Allowed: file writes and edits
Write { file_path: "/project/src/utils.ts", content: "..." }
Edit { file_path: "/project/src/index.ts", old_string: "...", new_string: "..." }

// Allowed: creating directories and moving files
Bash { command: "mkdir -p ./dist" }
Bash { command: "mv ./file.txt ./backup/" }
```

## Files

| Path | Purpose |
|------|---------|
| `skills/all-permissions/SKILL.md` | Skill definition |
| `scripts/toggle-all-permissions.js` | Enable/disable/status toggle |
| `scripts/scan-injections.js` | Security scanner |
| `scripts/scan-injections.test.js` | Security pattern tests |
| `hooks/hooks.json` | Hook configuration |
| `.claude/hook-enabled` | Runtime flag file |

## Requirements

- Node.js
- Claude Code with plugin support

## License

MIT License - see [LICENSE](LICENSE) for details.
