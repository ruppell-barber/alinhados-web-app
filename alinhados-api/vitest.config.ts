import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/modules/identidade/application/use-cases/**/*.ts',
        'src/modules/identidade/domain/entities/Conta.ts',
        'src/modules/identidade/domain/errors/**/*.ts',
        'src/modules/discovery/application/use-cases/**/*.ts',
        'src/modules/discovery/domain/errors/**/*.ts',
      ],
      exclude: ['**/*.spec.ts'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
});
