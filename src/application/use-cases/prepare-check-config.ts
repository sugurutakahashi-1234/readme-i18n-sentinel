import type { RawCLIOptions } from "../../domain/models/cli-options.js";
import type { Config } from "../../domain/models/config.js";

/**
 * Prepare and validate configuration for translation checks
 *
 * This use case handles:
 * - Merging CLI options into a complete configuration
 * - Validating that required configuration is present
 */
export async function prepareCheckConfigUseCase(
  cliOptions: RawCLIOptions,
): Promise<Config> {
  // Convert CLI options to config format
  const config: Config = {
    source: cliOptions.source ?? "",
    target: cliOptions.target ?? "",
    checks: {
      skip: {
        sectionStructure: cliOptions.skipSectionStructureCheck ?? false,
        lineCount: cliOptions.skipLineCountCheck ?? false,
      },
      require: {
        originalSectionTitles: cliOptions.requireOriginalSectionTitles ?? false,
        originalCodeBlocks: cliOptions.requireOriginalCodeBlocks ?? false,
      },
    },
    output: {
      json: cliOptions.json || false,
    },
  };

  // Validate the merged configuration
  if (!config.source || !config.target) {
    throw new Error(
      "Source and target pattern must be specified. Use --source and --target options.",
    );
  }

  return config;
}
