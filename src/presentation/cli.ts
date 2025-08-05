#!/usr/bin/env bun

import { Command } from "commander";
import { checkTranslationsUseCase } from "../application/use-cases/check-translations.js";
import { initConfigUseCase } from "../application/use-cases/init-config.js";
import { loadConfigUseCase } from "../application/use-cases/load-config.js";
import { validateConfigUseCase } from "../application/use-cases/validate-config.js";
import {
  getDescription,
  getPackageName,
  getVersion,
} from "../domain/constants/package-info.js";
import { RawCLIOptionsSchema } from "../domain/models/cli-options.js";
import {
  ConfigValidationError,
  UserCancelledError,
} from "../domain/models/errors.js";
import { mergeOptions } from "../domain/services/options-merger.js";
import {
  detectReadmeFiles,
  shouldUseAutoDetection,
} from "../domain/services/readme-detector.js";
import { printResult } from "../infrastructure/services/reporter.js";

const program = new Command();

// Default command
program
  .name(getPackageName())
  .description(getDescription())
  .version(getVersion(), "-v, --version", "display version number")
  .option("-c, --config <path>", "path to configuration file")
  .option("-s, --source <path>", "source README file path")
  .option(
    "-t, --target <pattern>",
    "target file pattern (glob supported, can be specified multiple times)",
    (value, previous) => {
      // Support multiple patterns by combining them
      if (previous) {
        // Combine patterns with glob syntax {pattern1,pattern2}
        return `{${previous},${value}}`;
      }
      return value;
    },
  )
  .option("--no-lines", "disable line count check")
  .option("--no-changes", "disable changes check")
  .option("--no-headings-match-source", "disable headings match check")
  .option("--json", "output in JSON format")
  .action(async (options: unknown) => {
    try {
      // Parse raw CLI options
      const cliOptions = RawCLIOptionsSchema.parse(options);

      // Load configuration
      const configFromFile = await loadConfigUseCase(cliOptions.config);

      // Check if we should use auto-detection
      if (shouldUseAutoDetection(!!configFromFile, !!cliOptions.source)) {
        // Auto-detect README files
        const detected = await detectReadmeFiles();

        if (!detected.source) {
          console.error(
            "❌ Error: No README.md file found in the current directory",
          );
          console.error(`Create a config with: ${getPackageName()} init`);
          console.error(
            `Or specify files: ${getPackageName()} --source <path> --target <path>`,
          );
          process.exit(2);
        }

        if (detected.targets.length === 0) {
          console.error("❌ Error: No translation files (README.*.md) found");
          console.error(
            "Make sure you have translation files like README.ja.md, README.zh-CN.md, etc.",
          );
          process.exit(2);
        }

        // Use detected files if not specified
        if (!cliOptions.source && !configFromFile?.source) {
          cliOptions.source = detected.source;
        }
        if (!cliOptions.target && !configFromFile?.target) {
          // Convert array of targets to glob pattern
          if (detected.targets.length === 1) {
            cliOptions.target = detected.targets[0];
          } else if (detected.targets.length > 1) {
            cliOptions.target = `{${detected.targets.join(",")}}`;
          }
        }
      }

      // Merge CLI options with config
      const config = mergeOptions(cliOptions, configFromFile);

      // Validate the merged configuration
      if (!config.source || !config.target) {
        console.error("❌ Error: Source and target pattern must be specified");
        console.error(
          "Use --source and --target options or create a config file",
        );
        process.exit(2);
      }

      // Print check settings if not in JSON mode
      if (!config.output?.json) {
        console.error("📖 Checking README translations...");
        if (config.checks?.headingsMatchSource !== false) {
          console.error(
            "Settings: headingsMatchSource=true (Headings must match source file exactly)",
          );
        }
        console.error(""); // Empty line for readability
      }

      // Run checks
      const result = await checkTranslationsUseCase(config);

      // Print results
      printResult(result, config.output?.json || false);

      // Exit with appropriate code
      process.exit(result.isValid ? 0 : 1);
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        console.error(`❌ Error: ${error.message}`);
        if (error.errors) {
          for (const err of error.errors) {
            console.error(`  - ${err.path}: ${err.message}`);
          }
        }
        process.exit(2);
      }

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
  $ ${getPackageName()} --no-lines
  
  # JSON output
  $ ${getPackageName()} --json
  
  # Use specific config file
  $ ${getPackageName()} -c myconfig.yml
  
  # Specify custom paths
  $ ${getPackageName()} --source docs/README.md --target "docs/README.*.md"
  
  # Override specific checks
  $ ${getPackageName()} --source README.md --target "README.*.md" --no-lines
  
  # Mix config file with overrides
  $ ${getPackageName()} -c config.json --json --no-changes
  
  # Create configuration interactively
  $ ${getPackageName()} init
  
  # Create configuration with defaults
  $ ${getPackageName()} init -y

Auto-detection:
  When no config file or CLI arguments are provided, the tool will:
  - Look for README.md as the source
  - Find all README.*.md files as targets (e.g., README.ja.md, README.zh-CN.md)

Config file search locations:
  - package.json ("${getPackageName()}" property)
  - .${getPackageName()}rc (no extension)
  - .${getPackageName()}rc.{json,yaml,yml,js,ts,mjs,cjs}
  - ${getPackageName()}.config.{js,ts,mjs,cjs}
  
Priority: CLI arguments > Config file > Auto-detection
  
For more information:
  https://github.com/sugurutakahashi-1234/${getPackageName()}
`,
  );

// Init subcommand
program
  .command("init")
  .description("Create a configuration file interactively")
  .option("-y, --yes", "skip prompts and use default settings", false)
  .action(async (options: { yes: boolean }) => {
    try {
      await initConfigUseCase(options.yes);
    } catch (error) {
      if (error instanceof UserCancelledError) {
        process.exit(0);
      }
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}`);
      process.exit(1);
    }
  });

// Validate subcommand
program
  .command("validate [configFile]")
  .description("Validate configuration file")
  .action(async (configFile?: string) => {
    try {
      const result = await validateConfigUseCase(configFile);

      if (result.success) {
        console.log("✅ Configuration is valid!");
        if (result.filepath) {
          console.log(`   File: ${result.filepath}`);
        }
        process.exit(0);
      } else {
        console.error("❌ Invalid configuration:");
        for (const error of result.errors || []) {
          console.error(`  - ${error.path}: ${error.message}`);
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(
        "❌ Error loading config:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
