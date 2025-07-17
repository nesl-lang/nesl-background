import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['app/tests/**/*.test.ts', 'app/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'tests/**/*.test.ts',
        'src/**/*.test.ts',
        'src/types.ts'
      ]
    }
  }
});