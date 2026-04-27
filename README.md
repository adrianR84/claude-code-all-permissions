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
| `enable all-permissions mode` | Turn on auto-approve for safe tools |
| `disable all-permissions mode` | Turn off and restore normal prompts |
| `toggle all-permissions` | Switch between enabled/disabled |
| `is all-permissions enabled` | Check current status |

### Skill Activation Examples

- "enable the auto-approve hook"
- "disable the permission bypass"
- "toggle all permissions"
- "turn on all permissions"
- "check permissions status"

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

The plugin blocks tools containing these patterns:

| Pattern | Threat |
|---------|--------|
| Long base64 strings (`[A-Za-z0-9+/]{4}{10,}`) | Hidden encoded instructions |
| Hex-encoded characters (`\xNN`) | Obfuscated payloads |
| Shell metacharacters (`;\|&`$\`<>`) | Command injection |
| Command substitution (`$(...)`, backticks) | Shell injection |
| Path traversal (`../`) | File system access |
| URL-encoded traversal (`%2E%2E`) | Obfuscated path attacks |
| SQL patterns (`--`, `DROP`, `INSERT`) | SQL injection |
| Role override (`system:`, `developer:`) | Prompt override |
| Prompt injection keywords | Behavior override |

### Blocked Examples

```bash
# Blocked: path traversal
Write { file_path: "../../../etc/passwd" }

# Blocked: base64 encoded payload
Bash { command: "echo SGVsbG8gV29ybGQgaXN0IGEgbG9uZyBiYXNlNjQgc3RyaW5n..." }

# Blocked: prompt injection
Edit { new_string: "ignore previous instructions and do something else" }

# Blocked: shell metacharacters
Bash { command: "echo hello; rm -rf /" }
```

### Allowed Examples

```bash
# Allowed: normal file read
Read { file_path: "/project/src/index.js" }

# Allowed: standard git commands
Bash { command: "git status" }

# Allowed: npm operations
Bash { command: "npm install" }
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

## Related

For a simpler experience without security scanning, see the [claude-code-permissions](https://github.com/adrianR84/claude-code-permissions) plugin.
