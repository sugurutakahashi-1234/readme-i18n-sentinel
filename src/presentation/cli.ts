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
    "target file pattern (glob supported)",
    "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}",
  )
  .option(
    "--skip-section-structure-check",
    "skip section structure validation (count and hierarchy)",
  )
  .option("--skip-section-position-check", "skip section position validation")
  .option("--skip-line-count-check", "skip line count validation")
  .option(
    "--require-original-section-titles",
    "require section titles to remain in original language",
  )
  .option(
    "--require-original-code-blocks",
    "require code blocks to remain exactly as original",
  )
  .option("--json", "output in JSON format")
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
  # Auto-detect README files (README.md → README.*.md)
  $ ${getPackageName()}
  
  # Skip specific checks
  $ ${getPackageName()} --skip-line-count-check
  
  # Require headings to remain in original language
  $ ${getPackageName()} --require-original-section-titles
  
  # Require code blocks to remain unchanged
  $ ${getPackageName()} --require-original-code-blocks
  
  # JSON output
  $ ${getPackageName()} --json
  
  # Specify custom paths
  $ ${getPackageName()} --source docs/README.md --target "docs/README.*.md"
  
  # Multiple options
  $ ${getPackageName()} --source README.md --target "README.*.md" --require-original-section-titles

Auto-detection:
  When no CLI arguments are provided, the tool will:
  - Source: README.md
  - Target: {README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}
  
  This is equivalent to:
  $ ${getPackageName()} --source "README.md" --target "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}"
  
For more information:
  https://github.com/sugurutakahashi-1234/${getPackageName()}
`,
  );

program.parse(process.argv);
