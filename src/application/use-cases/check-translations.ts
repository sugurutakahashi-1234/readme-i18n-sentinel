import { readFileSync } from "node:fs";
import type {
  CheckConfig,
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";
import type { RawCLIOptions } from "../../domain/models/cli-options.js";
import type { Config } from "../../domain/models/config.js";
import {
  checkChanges,
  checkHeadings,
  checkLines,
  extractHeadings,
} from "../../domain/services/translation-checker.js";
import { GitAdapter } from "../../infrastructure/adapters/git.adapter.js";
import { FileValidator } from "../../infrastructure/services/file-validator.js";
import {
  countLines,
  normalizeContent,
} from "../../infrastructure/services/normalizer.js";
import {
  detectReadmeFiles,
  shouldUseAutoDetection,
} from "../../infrastructure/services/readme-detector.js";

/**
 * Prepare config with auto-detection if needed
 */
export async function prepareConfig(
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
      checkLineCount: cliOptions.checkLineCount ?? true,
      checkChangedLines: cliOptions.checkChangedLines ?? true,
      strictHeadings: cliOptions.strictHeadings ?? false,
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

/**
 * Main use case for checking translations
 */
export async function checkTranslationsUseCase(
  config: Config,
): Promise<CheckResult> {
  const git = new GitAdapter(process.cwd());
  const fileValidator = new FileValidator();
  const errors: TranslationError[] = [];

  // Check if we're in a git repository
  const isGitRepo = await git.isGitRepository();
  if (!isGitRepo) {
    throw new Error("Not in a git repository");
  }

  // Validate source file exists
  fileValidator.validateSourceFile(config.source);

  // Read and normalize source content
  const sourceContent = normalizeContent(readFileSync(config.source, "utf-8"));
  const sourceLineCount = countLines(sourceContent);
  const sourceHeadings = extractHeadings(sourceContent);

  // Get changed lines if changes check is enabled
  let sourceChangedLines: number[] = [];
  if (config.checks?.checkChangedLines !== false) {
    sourceChangedLines = await git.getChangedLines(config.source);
  }

  // Expand and validate target files
  const { targetFiles, errors: validationErrors } =
    await fileValidator.expandAndValidateTargets(config.target);
  errors.push(...validationErrors);

  // Check each valid target file
  for (const targetFile of targetFiles) {
    // Read and normalize target content
    const targetContent = normalizeContent(readFileSync(targetFile, "utf-8"));
    const targetLineCount = countLines(targetContent);
    const targetHeadings = extractHeadings(targetContent);

    // Check headings if strict mode is enabled
    if (config.checks?.strictHeadings === true) {
      const headingErrors = checkHeadings(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...headingErrors);
    }

    // Check lines
    let lineMismatch = false;
    if (config.checks?.checkLineCount !== false) {
      const lineError = checkLines(
        sourceLineCount,
        targetLineCount,
        targetFile,
      );
      if (lineError) {
        errors.push(lineError);
        lineMismatch = true;
      }
    }

    // Check changes only if line counts match (line-based check)
    if (
      config.checks?.checkChangedLines !== false &&
      sourceChangedLines.length > 0 &&
      !lineMismatch
    ) {
      const targetChangedLines = await git.getChangedLines(targetFile);
      const changeErrors = checkChanges(
        sourceChangedLines,
        targetChangedLines,
        targetFile,
        sourceContent,
        targetContent,
      );
      errors.push(...changeErrors);
    }
  }

  // Create check config for result
  const checkConfig: CheckConfig = {
    source: config.source,
    target: config.target,
    checks: {
      checkLineCount: config.checks?.checkLineCount ?? true,
      checkChangedLines: config.checks?.checkChangedLines ?? true,
      strictHeadings: config.checks?.strictHeadings ?? false,
    },
    output: {
      json: config.output?.json ?? false,
    },
  };

  // Create summary if there are errors
  const result: CheckResult = {
    isValid: errors.length === 0,
    errors,
    config: checkConfig,
  };

  if (errors.length > 0) {
    const affectedFiles = [...new Set(errors.map((e) => e.file))];
    result.summary = {
      totalErrors: errors.length,
      affectedFiles,
    };
  }

  return result;
}

export type { RawCLIOptions } from "../../domain/models/cli-options.js";
