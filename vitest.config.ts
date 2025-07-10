import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/constants', 'packages/micromark-extension-mdsv'],
  },
});
