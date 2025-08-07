#!/usr/bin/env bun

import { Command } from "@commander-js/extra-typings";
import { checkTranslationsUseCase } from "../application/use-cases/check-translations.js";
import { prepareCheckConfigUseCase } from "../application/use-cases/prepare-check-config.js";
import { printResultUseCase } from "../application/use-cases/print-result.js";
import {
  getDescription,
  getPackageName,
  getVersion,
} from "../domain/constants/package-metadata.js";

const program = new Command();

// Default command
program
  .name(getPackageName())
  .description(getDescription())
  .version(getVersion(), "-v, --version", "display version number")
  .option("-s, --source <path>", "source README file path", "README.md")
  .option(
    "-t, --target <pattern>",
    "target file pattern, glob supported",
    "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}",
  )
  .option(
    "--skip-section-structure-check",
    "skip validation of heading count and hierarchy (# vs ##) (default: disabled)",
  )
  .option(
    "--skip-line-count-check",
    "skip validation of total line count and heading line positions (default: disabled)",
  )
  .option(
    "--require-original-section-titles",
    "require heading text to match exactly (e.g., ## Installation must stay in English) (default: disabled)",
  )
  .option(
    "--require-original-code-blocks",
    "require code blocks to match exactly (including content inside ```) (default: disabled)",
  )
  .option(
    "--json",
    "output results in JSON format for CI/CD integration (default: disabled)",
  )
  .action(async (options) => {
    try {
      // Parse and prepare config
      const config = await prepareCheckConfigUseCase(options);

      // Print check settings if not in JSON mode
      if (!config.output?.json) {
        console.log("📖 Checking README translations...");
      }

      // Run checks
      const result = await checkTranslationsUseCase(config);

      // Print results
      await printResultUseCase(result, config.output?.json || false);

      // Exit with appropriate code
      process.exit(result.isValid ? 0 : 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}`);
      process.exit(2);
    }
  })
  .addHelpText(
    "after",
    `
Examples:
  # Basic usage with auto-detection
  $ ${getPackageName()}
  
  # JSON output for CI/CD
  $ ${getPackageName()} --json
  
  # Custom paths
  $ ${getPackageName()} --source docs/README.md --target "docs/README.*.md"
  
For more information:
  https://github.com/sugurutakahashi-1234/${getPackageName()}
`,
  );

program.parse(process.argv);
