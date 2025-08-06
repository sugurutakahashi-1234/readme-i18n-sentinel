#!/usr/bin/env bun

import { Command } from "commander";
import {
  checkTranslationsUseCase,
  prepareConfig,
  type RawCLIOptions,
} from "../application/use-cases/check-translations.js";
import { printResultUseCase } from "../application/use-cases/print-result.js";
import {
  getDescription,
  getPackageName,
  getVersion,
} from "../domain/constants/package-info.js";

const program = new Command();

// Default command
program
  .name(getPackageName())
  .description(getDescription())
  .version(getVersion(), "-v, --version", "display version number")
  .option("-s, --source <path>", "source README file path")
  .option("-t, --target <pattern>", "target file pattern (glob supported)")
  .option("--no-check-line-count", "disable line count check")
  .option("--no-check-changed-lines", "disable changed lines check")
  .option(
    "--strict-headings",
    "enforce exact heading match (no translation allowed)",
  )
  .option("--json", "output in JSON format")
  .action(async (options: unknown) => {
    try {
      // Parse and prepare config
      const cliOptions = options as RawCLIOptions;
      const config = await prepareConfig(cliOptions);

      // Print check settings if not in JSON mode
      if (!config.output?.json) {
        console.error("📖 Checking README translations...");
        if (config.checks?.strictHeadings === true) {
          console.error(
            "Settings: strictHeadings=true (Headings must match source file exactly)",
          );
        }
        console.error(""); // Empty line for readability
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
  
  # Disable specific checks
  $ ${getPackageName()} --no-check-line-count
  
  # Enable strict heading checks (no translation allowed)
  $ ${getPackageName()} --strict-headings
  
  # JSON output
  $ ${getPackageName()} --json
  
  # Specify custom paths
  $ ${getPackageName()} --source docs/README.md --target "docs/README.*.md"
  
  # Multiple options
  $ ${getPackageName()} --source README.md --target "README.*.md" --strict-headings

Auto-detection:
  When no CLI arguments are provided, the tool will:
  - Look for README.md as the source
  - Find all README.*.md files as targets (e.g., README.ja.md, README.zh-CN.md)
  
For more information:
  https://github.com/sugurutakahashi-1234/${getPackageName()}
`,
  );

program.parse(process.argv);
