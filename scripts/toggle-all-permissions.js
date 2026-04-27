#!/usr/bin/env node

/**
 * Toggle all-permissions mode for the plugin
 * Usage: node toggle-all-permissions.js <enable|disable|status|toggle>
 */

const path = require('path');
const fs = require('fs');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const FLAG_FILE = path.join(PLUGIN_ROOT, '.claude', 'hook-enabled');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function enable() {
  ensureDir(path.dirname(FLAG_FILE));
  fs.writeFileSync(FLAG_FILE, '');
  console.log('All-permissions hook enabled');
}

function disable() {
  if (fs.existsSync(FLAG_FILE)) {
    fs.unlinkSync(FLAG_FILE);
  }
  console.log('All-permissions hook disabled');
}

function status() {
  const enabled = fs.existsSync(FLAG_FILE);
  console.log(`All-permissions hook: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  return enabled;
}

function toggle() {
  if (fs.existsSync(FLAG_FILE)) {
    disable();
  } else {
    enable();
  }
}

const command = process.argv[2] || 'status';

switch (command) {
  case 'enable':
    enable();
    break;
  case 'disable':
    disable();
    break;
  case 'status':
    status();
    break;
  case 'toggle':
    toggle();
    break;
  default:
    console.log(`Usage: node toggle-all-permissions.js <enable|disable|status|toggle>`);
    process.exit(1);
}
