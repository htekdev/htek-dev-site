import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.{ts,mts,mjs}', '**/*.test.{ts,mts,mjs}'],
    environment: 'node',
  },
});
