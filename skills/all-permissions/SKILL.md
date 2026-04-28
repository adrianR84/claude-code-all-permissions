---
name: all-permissions
description: Toggle all-permissions mode for auto-approving tool calls after security scanning. Use when user wants to enable/disable/toggle auto-approve or check permission status.
---

# All Permissions

## Skill Description

Toggle the all-permissions mode for this Claude Code plugin. When enabled, all tool calls are auto-approved after passing security scans for prompt injection patterns. When disabled, normal permission prompts occur.

**Use this skill whenever the user wants to:**
- Enable or disable auto-approve mode
- Toggle between enabled/disabled
- Check if auto-approve is currently active

## Usage

```bash
# Enable auto-approve mode
node ${CLAUDE_PLUGIN_ROOT}/scripts/toggle-all-permissions.js enable

# Disable auto-approve mode
node ${CLAUDE_PLUGIN_ROOT}/scripts/toggle-all-permissions.js disable

# Toggle (switch between enabled/disabled)
node ${CLAUDE_PLUGIN_ROOT}/scripts/toggle-all-permissions.js toggle

# Check current status
node ${CLAUDE_PLUGIN_ROOT}/scripts/toggle-all-permissions.js status
```

## Examples

- "enable all-permissions mode"
- "disable the auto-approve hook"
- "toggle all-permissions"
- "turn on all permissions"
- "is all-permissions enabled"
- "check permissions status"
- "disable all permissions"

## Auto-Approve Behavior

When enabled:
- **Allowed:** All tools except those blocked by security scans (see below) and tools with existing `ask` or `deny` rules in `settings.json`
- **Blocked:** Tools containing suspicious patterns are denied without prompts

The hook runs before each tool call and:
1. Scans for malicious patterns (see table below)
2. If pattern detected → tool is denied
3. If no pattern → tool is auto-approved (unless `settings.json` rules apply)

## Security Scanning

**Blocks** tools containing prompt injection patterns:
| Pattern | Example |
|---------|---------|
| `ignore` directive | `ignore all previous instructions` |
| `disregard` directive | `disregard previous commands` |
| `forget/clear` directive | `forget all previous` |
| Role override | `system:`, `developer:` |
| Jailbreak attempt | `new system prompt`, `new role instruction` |
| Base64 encoded data | 40+ char base64 strings |
| Hex-encoded characters | `\x48\x65\x6c\x6c\x6f` |

**Note:** Tools with `ask` or `deny` in `settings.json` are not auto-approved even when this mode is enabled.

## Files

- `scripts/toggle-all-permissions.js` - Toggle script (Node.js)
- `scripts/scan-injections.js` - Security scanner
- `hooks/hooks.json` - Hook configuration
- `.claude/hook-enabled` - Flag file (created when enabled)

## Notes

- Changes take effect immediately (no restart needed)
- State persists across sessions via flag file
- Hook configuration loads at Claude Code start (flag file controls runtime behavior)
