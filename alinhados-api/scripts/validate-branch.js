/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

try {
  let branchName = '';
  try {
    branchName = execSync('git branch --show-current').toString().trim();
  } catch (e) {
    // Se falhar (ex: repo vazio), tentamos outra abordagem
  }
  
  if (!branchName) {
    // Se não tem branch (ex: commit inicial antes de criar a branch), podemos assumir main ou develop para não quebrar.
    branchName = 'main';
  }
  
  if (branchName === 'main' || branchName === 'develop') {
    process.exit(0);
  }

  const validPatterns = [
    /^feature\/[A-Za-z0-9]+-[a-z0-9-]+$/,
    /^fix\/[A-Za-z0-9]+-[a-z0-9-]+$/,
    /^hotfix\/[A-Za-z0-9]+-[a-z0-9-]+$/,
    /^release\/v\d+\.\d+\.\d+$/
  ];

  const isValid = validPatterns.some(pattern => pattern.test(branchName));

  if (!isValid) {
    console.error(`\x1b[31mError: Branch name '${branchName}' does not follow the project conventions.\x1b[0m`);
    console.error('Allowed patterns:');
    console.error('- main');
    console.error('- develop');
    console.error('- feature/<US-ID>-descricao');
    console.error('- fix/<epico(s)>-descricao');
    console.error('- hotfix/<bug-ID>-descricao');
    console.error('- release/vX.Y.Z');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to validate branch name:', error.message);
  process.exit(1);
}
