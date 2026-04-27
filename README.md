# plugin-template

A template for creating Claude Code plugins.

## Installation

### Marketplace install (recommended)

**Slash commands:**
1. Add the marketplace:
   ```
   /plugin marketplace add adrianR84/claude-code-plugin-template
   ```
2. Install the plugin:
   ```
   /plugin install plugin-template/claude-code-plugin-template
   ```
3. Reload plugins:
   ```
   /reload-plugins
   ```

**CLI commands:**
```bash
claude plugin marketplace add adrianR84/claude-code-plugin-template
claude plugin install plugin-template/claude-code-plugin-template
claude plugin reload
```

### Session-Only (No Install)

```bash
git clone https://github.com/adrianR84/plugin-template.git
cd plugin-template
claude --plugin-dir .
```

## Usage

### Skill: `/example-skill`

Activate by asking to use the example skill.

## MCP Tools

| Tool | Description |
|------|-------------|
| `example_tool` | Example MCP tool |

## Requirements

- Node.js
- Claude Code with plugin support

## License

MIT
