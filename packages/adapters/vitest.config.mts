import tsconfigPaths from 'vite-tsconfig-paths';
import { defineProject } from 'vitest/config';

export default defineProject(() => {
  return {
    plugin: tsconfigPaths(),
    test: {
      include: ['**/*.test.ts'],
      pool: 'forks',
      globals: true,
    },
  };
});
