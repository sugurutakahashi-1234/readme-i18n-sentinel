import type { RawCLIOptions } from "../../domain/models/cli-options.js";
import type { Config } from "../../domain/models/config.js";
import {
  detectReadmeFiles,
  shouldUseAutoDetection,
} from "../../infrastructure/services/readme-detector.js";

/**
 * Prepare and validate configuration for translation checks
 *
 * This use case handles:
 * - Auto-detection of README files when no source is specified
 * - Merging CLI options into a complete configuration
 * - Validating that required configuration is present
 */
export async function prepareCheckConfigUseCase(
  cliOptions: RawCLIOptions,
): Promise<Config> {
  // Check if we should use auto-detection
  if (shouldUseAutoDetection(!!cliOptions.source)) {
    // Auto-detect README files
    const detected = await detectReadmeFiles();

    if (!detected.source) {
      throw new Error(
        "No README.md file found in the current directory. Specify files with --source and --target options.",
      );
    }

    if (detected.targets.length === 0) {
      throw new Error(
        "No translation files (README.*.md) found. Make sure you have translation files like README.ja.md, README.zh-CN.md, etc.",
      );
    }

    // Use detected files if not specified
    if (!cliOptions.source) {
      cliOptions.source = detected.source;
    }
    if (!cliOptions.target) {
      // Convert array of targets to glob pattern
      if (detected.targets.length === 1) {
        cliOptions.target = detected.targets[0];
      } else if (detected.targets.length > 1) {
        cliOptions.target = `{${detected.targets.join(",")}}`;
      }
    }
  }

  // Convert CLI options to config format
  const config: Config = {
    source: cliOptions.source || "",
    target: cliOptions.target || "",
    checks: {
      sectionStructure: cliOptions.sectionStructure ?? true,
      sectionPosition: cliOptions.sectionPosition ?? true,
      sectionTitle: cliOptions.sectionTitle ?? false,
      lineCount: cliOptions.lineCount ?? true,
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

export type { RawCLIOptions } from "../../domain/models/cli-options.js";
