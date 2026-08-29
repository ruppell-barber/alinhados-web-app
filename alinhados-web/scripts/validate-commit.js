/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error('No commit message file provided');
  process.exit(1);
}

const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

// Padrão: <tipo>(<escopo opcional>): <descricao no imperativo>
// Tipos: feat, fix, refactor, ci, docs, test, chore
const pattern = /^(feat|fix|refactor|ci|docs|test|chore)(\([a-zA-Z0-9_-]+\))?:\s.+/;

if (!pattern.test(commitMsg)) {
  console.error(`\x1b[31mError: Commit message does not follow Conventional Commits.\x1b[0m`);
  console.error('Expected format: <tipo>(<escopo opcional>): <descricao no imperativo>');
  console.error('Allowed types: feat, fix, refactor, ci, docs, test, chore');
  console.error(`Your message was:\n${commitMsg}`);
  process.exit(1);
}
