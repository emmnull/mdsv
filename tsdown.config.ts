import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  platform: 'neutral',
  exports: {
    devExports: true,
  },
  workspace: 'packages/*',
  skipNodeModulesBundle: true,
});
