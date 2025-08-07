import { existsSync, readFileSync } from "node:fs";
import type {
  CheckConfig,
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";
import type { Config } from "../../domain/models/config.js";
import {
  checkCodeBlockMatch,
  checkLines,
  checkSectionLines,
  checkSectionOrder,
  checkSectionTitleMatch,
  extractCodeBlocks,
  extractHeadings,
} from "../../domain/services/translation-checker.js";
import { findFilesByPattern } from "../../infrastructure/adapters/glob.adapter.js";
import {
  countLines,
  normalizeContent,
} from "../../infrastructure/services/content-normalizer.js";

/**
 * Main use case for checking translations
 */
export async function checkTranslationsUseCase(
  config: Config,
): Promise<CheckResult> {
  const errors: TranslationError[] = [];

  // Validate source file exists
  if (!existsSync(config.source)) {
    throw new Error(`Source file not found: ${config.source}`);
  }

  // Read and normalize source content
  const sourceContent = normalizeContent(readFileSync(config.source, "utf-8"));
  const sourceLineCount = countLines(sourceContent);
  const sourceHeadings = extractHeadings(sourceContent);

  // Expand target pattern to find matching files
  const targetFiles = await findFilesByPattern(config.target);

  // If no target files match the pattern, findFilesByPattern returns an empty array.
  // This is the expected and relied-upon behavior: the absence of target files is not treated as an error (e.g., for README-only repos).

  // Check each valid target file
  for (const targetFile of targetFiles) {
    // Read and normalize target content
    const targetContent = normalizeContent(readFileSync(targetFile, "utf-8"));
    const targetLineCount = countLines(targetContent);
    const targetHeadings = extractHeadings(targetContent);

    // 1. Check section structure (count and hierarchy) first
    if (!config.checks?.skip?.sectionStructure) {
      const orderErrors = checkSectionOrder(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      if (orderErrors.length > 0) {
        errors.push(...orderErrors);
        // Continue checking other aspects even if order is wrong
      }
    }

    // 2. Check section positions (skip if line count check is also skipped)
    if (!config.checks?.skip?.lineCount) {
      const lineErrors = checkSectionLines(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...lineErrors);
    }

    // 3. Check section titles (if required)
    if (config.checks?.require?.originalSectionTitles) {
      const titleErrors = checkSectionTitleMatch(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...titleErrors);
    }

    // 4. Check code blocks (if required)
    if (config.checks?.require?.originalCodeBlocks) {
      const sourceBlocks = extractCodeBlocks(sourceContent, sourceHeadings);
      const targetBlocks = extractCodeBlocks(targetContent, targetHeadings);
      const codeBlockErrors = checkCodeBlockMatch(
        sourceBlocks,
        targetBlocks,
        targetFile,
      );
      errors.push(...codeBlockErrors);
    }

    // 5. Finally, check total line count
    if (!config.checks?.skip?.lineCount) {
      const lineError = checkLines(
        sourceLineCount,
        targetLineCount,
        targetFile,
      );
      if (lineError) {
        errors.push(lineError);
      }
    }
  }

  // Create check config for result
  const checkConfig: CheckConfig = {
    source: config.source,
    target: config.target,
    checks: {
      skip: {
        sectionStructure: config.checks?.skip?.sectionStructure ?? false,
        sectionPosition: config.checks?.skip?.lineCount ?? false,
        lineCount: config.checks?.skip?.lineCount ?? false,
      },
      require: {
        originalSectionTitles:
          config.checks?.require?.originalSectionTitles ?? false,
        originalCodeBlocks: config.checks?.require?.originalCodeBlocks ?? false,
      },
    },
    output: {
      json: config.output?.json ?? false,
    },
  };

  // Extract failed files from errors
  const failedFiles = [...new Set(errors.map((e) => e.file))];

  // Calculate passed files
  const passedFiles = targetFiles.filter((f) => !failedFiles.includes(f));

  // Create result with summary
  const result: CheckResult = {
    isValid: errors.length === 0,
    errors,
    config: checkConfig,
    summary: {
      source: config.source,
      targetPattern: config.target,
      checkedFiles: targetFiles,
      passedFiles,
      failedFiles,
    },
  };

  return result;
}
