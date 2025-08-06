import { readFileSync } from "node:fs";
import type {
  CheckConfig,
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";
import type { Config } from "../../domain/models/config.js";
import {
  checkLines,
  checkSectionLines,
  checkSectionOrder,
  checkSectionTitleMatch,
  extractHeadings,
} from "../../domain/services/translation-checker.js";
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
  const fileValidator = new FileValidator();
  const errors: TranslationError[] = [];

  // Validate source file exists
  fileValidator.validateSourceFile(config.source);

  // Read and normalize source content
  const sourceContent = normalizeContent(readFileSync(config.source, "utf-8"));
  const sourceLineCount = countLines(sourceContent);
  const sourceHeadings = extractHeadings(sourceContent);

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

    // 1. Check section structure (count and hierarchy) first
    if (config.checks?.sectionStructure !== false) {
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

    // 2. Check section positions
    if (config.checks?.sectionPosition !== false) {
      const lineErrors = checkSectionLines(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...lineErrors);
    }

    // 3. Check section titles (if required)
    if (config.checks?.sectionTitle === true) {
      const titleErrors = checkSectionTitleMatch(
        sourceHeadings,
        targetHeadings,
        targetFile,
      );
      errors.push(...titleErrors);
    }

    // 4. Finally, check total line count
    if (config.checks?.lineCount !== false) {
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
      sectionStructure: config.checks?.sectionStructure ?? true,
      sectionPosition: config.checks?.sectionPosition ?? true,
      sectionTitle: config.checks?.sectionTitle ?? false,
      lineCount: config.checks?.lineCount ?? true,
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
