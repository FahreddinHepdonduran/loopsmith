#!/usr/bin/env node
'use strict';

/**
 * loopsmith installer
 *
 * Copies the loopsmith skills into a Claude Code skills directory.
 * Zero dependencies, just Node's standard library.
 *
 *   npx loopsmith              install into ~/.claude/skills (global, default)
 *   npx loopsmith --project    install into ./.claude/skills (current repo)
 *   npx loopsmith --dir <path> install into a custom skills directory
 *   npx loopsmith --help       show this help
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const SKILLS = ['verify-loop', 'grade', 'loop-cost'];
const SRC_DIR = path.join(__dirname, '..', 'skills');

const tty = process.stdout.isTTY;
const c = {
  reset: tty ? '\x1b[0m' : '',
  dim: tty ? '\x1b[2m' : '',
  bold: tty ? '\x1b[1m' : '',
  green: tty ? '\x1b[32m' : '',
  cyan: tty ? '\x1b[36m' : '',
  yellow: tty ? '\x1b[33m' : '',
  red: tty ? '\x1b[31m' : '',
};

function parseArgs(argv) {
  const a = { target: 'global', dir: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--help' || x === '-h') a.help = true;
    else if (x === '--project' || x === '--local') a.target = 'project';
    else if (x === '--global') a.target = 'global';
    else if (x === '--dir') { a.dir = argv[++i]; a.target = 'dir'; }
    else if (x.startsWith('--dir=')) { a.dir = x.slice('--dir='.length); a.target = 'dir'; }
    else { console.error(`${c.yellow}Unknown option: ${x}${c.reset}`); a.help = true; }
  }
  return a;
}

function resolveTarget(a) {
  if (a.target === 'dir') {
    if (!a.dir) fail('--dir needs a path, for example: npx loopsmith --dir ./.claude/skills');
    return path.resolve(a.dir);
  }
  if (a.target === 'project') return path.resolve(process.cwd(), '.claude', 'skills');
  return path.join(os.homedir(), '.claude', 'skills');
}

function fail(msg) {
  console.error(`${c.red}loopsmith: ${msg}${c.reset}`);
  process.exit(1);
}

function help() {
  console.log(`
${c.bold}loopsmith${c.reset} ${c.dim}- loop engineering for coding agents${c.reset}

Installs three Claude Code skills: ${c.cyan}verify-loop${c.reset}, ${c.cyan}grade${c.reset}, ${c.cyan}loop-cost${c.reset}.

${c.bold}Usage${c.reset}
  npx loopsmith              install into ~/.claude/skills ${c.dim}(global, default)${c.reset}
  npx loopsmith --project    install into ./.claude/skills ${c.dim}(current repo)${c.reset}
  npx loopsmith --dir <path> install into a custom skills directory
  npx loopsmith --help       show this help
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { help(); return; }

  if (!fs.existsSync(SRC_DIR)) {
    fail(`could not find bundled skills at ${SRC_DIR}. This is a packaging bug.`);
  }

  const target = resolveTarget(args);
  fs.mkdirSync(target, { recursive: true });

  console.log(`\n${c.bold}loopsmith${c.reset} ${c.dim}->${c.reset} ${target}\n`);

  let installed = 0;
  let updated = 0;
  for (const skill of SKILLS) {
    const src = path.join(SRC_DIR, skill);
    if (!fs.existsSync(src)) {
      console.log(`  ${c.yellow}skip${c.reset}  ${skill} ${c.dim}(missing in package)${c.reset}`);
      continue;
    }
    const dest = path.join(target, skill);
    const existed = fs.existsSync(dest);
    fs.cpSync(src, dest, { recursive: true });
    if (existed) { updated++; console.log(`  ${c.cyan}updated${c.reset}  ${skill}`); }
    else { installed++; console.log(`  ${c.green}added${c.reset}    ${skill}`); }
  }

  const total = installed + updated;
  console.log(`\n${c.green}done${c.reset} ${total} skill${total === 1 ? '' : 's'} ready ${c.dim}(${installed} added, ${updated} updated)${c.reset}`);
  console.log(`\nTry it in Claude Code:`);
  console.log(`  ${c.cyan}/verify-loop${c.reset} "add pagination to the users endpoint and make the tests pass"\n`);
}

main();
