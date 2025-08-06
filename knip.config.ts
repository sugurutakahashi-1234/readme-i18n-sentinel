import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Let knip auto-detect entry points from package.json
  project: ["src/**/*.ts"],
  ignoreDependencies: ["tslib", "@commitlint/cli"], // tslib is a runtime dependency, @commitlint/cli is used in CI only
  ignoreBinaries: ["node-size"], // node-size: used in npm scripts
  ignoreExportsUsedInFile: false,

  // IMPORTANT: Keep this as true to detect real unused exports
  // DO NOT set to false - it would hide real issues
  includeEntryExports: true,

  // Workaround: knip doesn't recognize package.json "exports" field
  // Files listed here contain public APIs exported via package.json
  ignore: [],

  typescript: {
    config: ["tsconfig.json"],
  },

  // DO NOT add tags: ["+public"] - requires maintaining @public JSDoc tags
  // Instead, use the ignore array above for public API files
};

export default config;
