import type { RawCLIOptions } from "../models/cli-options.js";
import type { Config } from "../models/config.js";

/**
 * Merge CLI options with config file options
 *
 * Priority order:
 * 1. CLI options (what the user explicitly typed)
 * 2. Config file options
 * 3. Default values (defined in ConfigSchema)
 *
 * @param cliOptions - Raw CLI options from command line
 * @param config - Config loaded from file (or null)
 * @returns Merged configuration
 */
export function mergeOptions(
  cliOptions: RawCLIOptions,
  config: Config | null,
): Config {
  // Start with config or defaults
  const baseConfig: Config = config || {
    source: "",
    target: "",
    checks: {
      lines: true,
      changes: true,
      headingsMatchSource: true,
    },
    output: {
      json: false,
    },
  };

  // Build checks object with CLI overrides
  const checks = {
    lines:
      cliOptions.lines !== undefined
        ? cliOptions.lines
        : baseConfig.checks.lines,
    changes:
      cliOptions.changes !== undefined
        ? cliOptions.changes
        : baseConfig.checks.changes,
    headingsMatchSource:
      cliOptions.headingsMatchSource !== undefined
        ? cliOptions.headingsMatchSource
        : baseConfig.checks.headingsMatchSource,
  };

  // Build output object with CLI overrides
  const output = {
    json:
      cliOptions.json !== undefined ? cliOptions.json : baseConfig.output.json,
  };

  // Return merged config
  return {
    source: cliOptions.source || baseConfig.source,
    target: cliOptions.target || baseConfig.target,
    checks,
    output,
  };
}
