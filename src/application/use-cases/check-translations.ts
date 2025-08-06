import { readFileSync } from "node:fs";
import type {
  CheckConfig,
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";
import type { Config } from "../../domain/models/config.js";
import {
  checkChanges,
  checkHeadings,
  checkLines,
  extractHeadings,
} from "../../domain/services/translation-checker.js";
import { GitAdapter } from "../../infrastructure/adapters/git.adapter.js";
import {
  countLines,
  normalizeContent,
} from "../../infrastructure/services/content-normalizer.js";
import { FileValidator } from "../../infrastructure/services/file-validator.js";

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
