#!/usr/bin/env node

/**
 * PreToolUse Hook: Scans for prompt injections and auto-approves safe operations.
 * Reads JSON input from stdin, outputs JSON decision to stdout.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';

rl.on('line', (line) => {
  inputData += line;
});

rl.on('close', () => {
  try {
    const input = JSON.parse(inputData);
    const result = processToolCall(input);
    console.log(JSON.stringify(result));
  } catch (err) {
    // Exit code 2 = blocking error
    process.exit(2);
  }
});

const INJECTION_PATTERNS = [
  { name: 'base64_encoded', pattern: /(?:[A-Za-z0-9+/]{4}){10,}/, description: 'Long base64 string' },
  { name: 'hex_encoded', pattern: /\\x[0-9a-fA-F]{2,}/, description: 'Hex-encoded characters' },
  { name: 'role_override', pattern: /(?:system|developer|instruction)s?:/i, description: 'Role/instruction override' },
  { name: 'prompt_injection', pattern: /(?:ignore previous|ignore all|disregard|prompt injection)/i, description: 'Prompt injection keywords' },
  { name: 'shell_metachar', pattern: /[;|&`$<>]/, description: 'Shell metacharacters' },
  { name: 'command_subst', pattern: /\$\([^)]+\)/, description: 'Command substitution $(...)' },
  { name: 'backtick_subst', pattern: /`[^`]+`/, description: 'Command substitution backticks' },
  { name: 'url_encoded', pattern: /%2E%2E|%2F%2E%2E/i, description: 'URL encoded path traversal' },
  { name: 'sql_comment', pattern: /--\s|\/\*|\*\/|;\s*(?:drop|delete|insert|update)/i, description: 'SQL comment or dangerous statement' }
];

function scanForInjections(toolInput) {
  const findings = [];
  const inputStr = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);

  for (const rule of INJECTION_PATTERNS) {
    if (rule.pattern.test(inputStr)) {
      findings.push({ pattern: rule.name, description: rule.description });
    }
  }

  return findings;
}

function checkPathTraversal(toolInput) {
  if (toolInput && toolInput.file_path) {
    if (toolInput.file_path.includes('..')) {
      return [{ pattern: 'path_traversal', description: 'Parent directory reference in path' }];
    }
  }
  return [];
}

function processToolCall(input) {
  const { tool_name, tool_input } = input;

  // Check for injection patterns
  const findings = scanForInjections(tool_input);

  // Check for path traversal
  const pathFindings = checkPathTraversal(tool_input);
  findings.push(...pathFindings);

  if (findings.length > 0) {
    console.error(JSON.stringify({ tool: tool_name, decision: 'deny', findings }));
    // Exit code 2 = blocking error (stderr shown to Claude)
    process.exit(2);
  }

  // Auto-allow safe tools
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow'
    }
  };
}
