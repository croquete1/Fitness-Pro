#!/usr/bin/env node
const { execSync } = require('node:child_process');

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  run('npm run typecheck');
  process.exit(0);
} catch {
  process.exit(1);
}
