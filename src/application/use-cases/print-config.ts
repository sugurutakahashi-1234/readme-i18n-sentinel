import type { Config } from "../../domain/models/config.js";

/**
 * Format config as human-readable text for display
 * Shows active options in a concise format
 */
export function printConfigUseCase(config: Config): void {
  // Display source and target
  console.log(`Source: ${config.source}`);
  console.log(`Target: ${config.target}`);

  // Collect active options
  const options: string[] = [];

  // Add skip options
  if (config.checks.skip.sectionStructure) {
    options.push("--skip-section-structure-check");
  }
  if (config.checks.skip.lineCount) {
    options.push("--skip-line-count-check");
  }

  // Add require options
  if (config.checks.require.originalSectionTitles) {
    options.push("--require-original-section-titles");
  }
  if (config.checks.require.originalCodeBlocks) {
    options.push("--require-original-code-blocks");
  }

  // Display options if any are active
  if (options.length > 0) {
    console.log(`Options: ${options.join(" ")}`);
  }
}
