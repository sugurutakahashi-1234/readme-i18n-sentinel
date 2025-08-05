import { existsSync, readFileSync } from "node:fs";
import type {
  CheckResult,
  LineCountMismatch,
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
import { findFilesByPattern } from "../../infrastructure/adapters/glob.adapter.js";
import {
  countLines,
  normalizeContent,
} from "../../infrastructure/services/normalizer.js";

export async function checkTranslationsUseCase(
  config: Config,
): Promise<CheckResult> {
  const git = new GitAdapter(process.cwd());
  const errors: TranslationError[] = [];

  // Check if we're in a git repository
  const isGitRepo = await git.isGitRepository();
  if (!isGitRepo) {
    throw new Error("Not in a git repository");
  }

  // Check if source file exists
  if (!existsSync(config.source)) {
    throw new Error(`Source file not found: ${config.source}`);
  }

  // Read and normalize source content
  const sourceContent = normalizeContent(readFileSync(config.source, "utf-8"));
  const sourceLineCount = countLines(sourceContent);
  const sourceHeadings = extractHeadings(sourceContent);

  // Get changed lines if changes check is enabled
  let sourceChangedLines: number[] = [];
  if (config.checks?.changes !== false) {
    sourceChangedLines = await git.getChangedLines(config.source);
  }

  // Expand glob pattern in target
  let targetFiles: string[] = [];

  // Check if it's a glob pattern (contains *, ?, [, ], {, })
  if (/[*?[\]{}]/.test(config.target)) {
    const matchedFiles = await findFilesByPattern(config.target);
    if (matchedFiles.length === 0) {
      errors.push({
        type: "line-count-mismatch",
        file: config.target,
        expected: 1,
        actual: 0,
        difference: 1,
        suggestion: `No files found matching pattern: ${config.target}. Check if the pattern is correct`,
      } as LineCountMismatch);
    } else {
      targetFiles = matchedFiles;
    }
  } else {
    // It's a literal file path
    targetFiles = [config.target];
  }

  // Check each target file
  for (const targetFile of targetFiles) {
    // Check if target file exists
    if (!existsSync(targetFile)) {
      errors.push({
        type: "line-count-mismatch",
        file: targetFile,
        expected: 1,
        actual: 0,
        difference: 1,
        suggestion: `Target file ${targetFile} not found. Create the file or check the path`,
      } as LineCountMismatch);
      continue;
    }

    // Read and normalize target content
    const targetContent = normalizeContent(readFileSync(targetFile, "utf-8"));
    const targetLineCount = countLines(targetContent);
    const targetHeadings = extractHeadings(targetContent);

    // Check headings first (structural check)
    if (config.checks?.headingsMatchSource !== false) {
      const headingErrors = checkHeadings(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...headingErrors);
    }

    // Check lines
    let lineMismatch = false;
    if (config.checks?.lines !== false) {
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
      config.checks?.changes !== false &&
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

  // Create summary if there are errors
  const result: CheckResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (errors.length > 0) {
    const affectedFiles = [...new Set(errors.map((e) => e.file))];
    result.summary = {
      totalErrors: errors.length,
      affectedFiles,
      suggestion:
        affectedFiles.length === 1
          ? `Update ${affectedFiles[0]} to match the structure and content of ${config.source}`
          : `Update the translation files to match ${config.source}`,
    };
  }

  return result;
}
