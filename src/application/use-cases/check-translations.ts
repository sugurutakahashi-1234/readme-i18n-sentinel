import { existsSync, readFileSync } from "node:fs";
import type { CheckResult } from "../../domain/models/check-result.js";
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
  const errors: CheckResult["errors"] = [];

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
        file: config.target,
        type: "lines-mismatch",
        details: `No files matching pattern: ${config.target}`,
      });
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
        file: targetFile,
        type: "lines-mismatch",
        details: "Target file not found",
      });
      continue;
    }

    // Read and normalize target content
    const targetContent = normalizeContent(readFileSync(targetFile, "utf-8"));
    const targetLineCount = countLines(targetContent);
    const targetHeadings = extractHeadings(targetContent);

    // Check lines
    if (config.checks?.lines !== false) {
      const lineError = checkLines(
        sourceLineCount,
        targetLineCount,
        targetFile,
      );
      if (lineError) {
        errors.push(lineError);
      }
    }

    // Check changes
    if (config.checks?.changes !== false && sourceChangedLines.length > 0) {
      const targetChangedLines = await git.getChangedLines(targetFile);
      const changeErrors = checkChanges(
        sourceChangedLines,
        targetChangedLines,
        targetFile,
      );
      errors.push(...changeErrors);
    }

    // Check headings
    if (config.checks?.headingsMatchSource !== false) {
      const headingErrors = checkHeadings(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...headingErrors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
