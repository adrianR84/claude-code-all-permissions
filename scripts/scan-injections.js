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

const PROMPT_INJECTION_PATTERNS = [
  { name: 'ignore_directive', pattern: /\bignore\s+(?:all\s+)?(?:previous|instructions?|commands?)/i },
  { name: 'disregard_directive', pattern: /\bdisregard\s+(?:all\s+)?(?:previous|instructions?)/i },
  { name: 'forget_directive', pattern: /(?:forget|clear)\s+(?:all\s+)?previous/i },
  { name: 'role_override', pattern: /(?:system|developer|instruction)\s*:/i },
  { name: 'jailbreak_attempt', pattern: /(?:new\s+)?(?:system|role)\s+(?:prompt|instruction)/i },
  { name: 'system_role_override', pattern: /system\s+role\s*(?:override|injection)/i },
  { name: 'base64_encoded', pattern: /(?:[A-Za-z0-9+/]{4}){10,}/ },
  { name: 'hex_encoded', pattern: /\\x[0-9a-fA-F]{2,}/ }
];

function scanForInjections(toolInput) {
  const findings = [];
  const inputStr = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);

  for (const rule of PROMPT_INJECTION_PATTERNS) {
    if (rule.pattern.test(inputStr)) {
      findings.push({ pattern: rule.name });
    }
  }

  return findings;
}

function processToolCall(input) {
  const { tool_name, tool_input } = input;

  const findings = scanForInjections(tool_input);

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