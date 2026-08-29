/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const files = process.argv.slice(2).filter(f => fs.existsSync(f));

if (files.length === 0) {
  process.exit(0);
}


async function run() {
  console.log(`🔍 Verificando ${files.length} arquivo(s) afetado(s) pelo push...\n`);
  let hasErrors = false;

  const jsFiles = files.filter(f => f.match(/\.(js|mjs|cjs|ts)$/));
  const prettierFiles = files.filter(f => f.match(/\.(js|mjs|cjs|ts|json|md|yml|yaml)$/));
  
  if (prettierFiles.length === 0 && jsFiles.length === 0) {
    console.log('\n✅ Nenhum arquivo suportado para lint/format. Push liberado.');
    process.exit(0);
  }

  try {
    if (jsFiles.length > 0) {
      execSync(`npx eslint ${jsFiles.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
    }
  } catch {
    hasErrors = true;
  }

  try {
    if (prettierFiles.length > 0) {
      execSync(`npx prettier --check ${prettierFiles.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
    }
  } catch {
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('\n✅ Nenhum erro encontrado! Push liberado.');
    process.exit(0);
  }

  console.log('\n⚠️  Foram encontrados problemas de formatação ou linting.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  const answer = await question('Deseja aplicar as correções automaticamente (fix)? [Y/n]: ');
  rl.close();

  if (answer.trim().toLowerCase() === 'y' || answer.trim() === '') {
    console.log('\n🔧 Aplicando fixes...');
    try {
      if (jsFiles.length > 0) {
        execSync(`npx eslint --fix ${jsFiles.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
      }
      if (prettierFiles.length > 0) {
        execSync(`npx prettier --write ${prettierFiles.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
      }
      console.log('\n✅ Correções aplicadas com sucesso!');
      console.log('⛔ O Push foi abortado para que você possa commitar as alterações feitas. Faça o commit das mudanças e rode o push novamente.');
    } catch {
      console.error('\n❌ Alguns erros não puderam ser corrigidos automaticamente. Por favor, corrija-os manualmente.');
    }
  } else {
    console.log('\n⛔ Push abortado.');
  }

  process.exit(1);
}

run();
