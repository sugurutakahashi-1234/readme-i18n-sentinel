import type {
  HeadingCountMismatch,
  HeadingMismatch,
  LineCountMismatch,
  MissingHeading,
  OutdatedLine,
  TranslationError,
} from "../models/check-result.js";

interface Heading {
  level: number;
  text: string;
  line: number;
}

/**
 * Check if source and target files have the same number of lines
 */
export function checkLines(
  sourceLineCount: number,
  targetLineCount: number,
  targetFile: string,
): LineCountMismatch | null {
  if (sourceLineCount !== targetLineCount) {
    const difference = sourceLineCount - targetLineCount;
    return {
      type: "line-count-mismatch",
      file: targetFile,
      expected: sourceLineCount,
      actual: targetLineCount,
      difference,
      suggestion:
        difference > 0
          ? `Add ${difference} lines to match the source file`
          : `Remove ${Math.abs(difference)} lines to match the source file`,
    };
  }
  return null;
}

/**
 * Check if changed lines in source are also changed in target
 */
export function checkChanges(
  sourceChangedLines: number[],
  targetChangedLines: number[],
  targetFile: string,
  sourceContent?: string,
  targetContent?: string,
): OutdatedLine[] {
  const errors: OutdatedLine[] = [];
  const targetChangedSet = new Set(targetChangedLines);

  for (const line of sourceChangedLines) {
    if (!targetChangedSet.has(line)) {
      const sourceLines = sourceContent?.split("\n") || [];
      const targetLines = targetContent?.split("\n") || [];
      const expectedContent = sourceLines[line - 1] || "";
      const currentContent = targetLines[line - 1];

      const error: OutdatedLine = {
        type: "outdated-line",
        file: targetFile,
        lineNumber: line,
        expectedContent,
        suggestion: `Update line ${line} with the new content from the source file`,
      };

      if (currentContent !== undefined) {
        error.currentContent = currentContent;
      }

      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if headings in source and target match exactly
 */
export function checkHeadings(
  sourceHeadings: Heading[],
  targetHeadings: Heading[],
  targetFile: string,
): TranslationError[] {
  const errors: TranslationError[] = [];

  // Early return if heading count doesn't match
  if (sourceHeadings.length !== targetHeadings.length) {
    const difference = sourceHeadings.length - targetHeadings.length;
    errors.push({
      type: "heading-count-mismatch",
      file: targetFile,
      expected: sourceHeadings.length,
      actual: targetHeadings.length,
      difference,
      suggestion:
        difference > 0
          ? `Add ${difference} headings to match the source structure. Check which headings are missing and add them in the correct order.`
          : `Remove ${Math.abs(difference)} extra headings to match the source structure.`,
    } as HeadingCountMismatch);
    return errors; // Early return to avoid unnecessary detailed checks
  }

  // Only check individual headings if the count matches
  const targetHeadingMap = new Map(
    targetHeadings.map((h) => [`${h.level}-${h.text}`, h]),
  );

  // Check for missing headings
  for (const sourceHeading of sourceHeadings) {
    const key = `${sourceHeading.level}-${sourceHeading.text}`;
    if (!targetHeadingMap.has(key)) {
      errors.push({
        type: "missing-heading",
        file: targetFile,
        heading: sourceHeading.text,
        level: sourceHeading.level,
        suggestion: `Add heading "${"#".repeat(
          sourceHeading.level,
        )} ${sourceHeading.text}" to match the source structure`,
      } as MissingHeading);
    }
  }

  // Check for heading mismatches at each position
  for (let i = 0; i < sourceHeadings.length; i++) {
    const sourceHeading = sourceHeadings[i];
    const targetHeading = targetHeadings[i];

    if (!sourceHeading || !targetHeading) {
      continue;
    }

    if (
      sourceHeading.level !== targetHeading.level ||
      sourceHeading.text !== targetHeading.text
    ) {
      errors.push({
        type: "heading-mismatch",
        file: targetFile,
        lineNumber: targetHeading.line,
        expected: {
          level: sourceHeading.level,
          text: sourceHeading.text,
        },
        actual: {
          level: targetHeading.level,
          text: targetHeading.text,
        },
        suggestion: `Replace "${"#".repeat(
          targetHeading.level,
        )} ${targetHeading.text}" with "${"#".repeat(
          sourceHeading.level,
        )} ${sourceHeading.text}" at line ${targetHeading.line}`,
      } as HeadingMismatch);
    }
  }

  return errors;
}

/**
 * Extract headings from file content
 */
export function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    if (!line) {
      continue;
    }

    // Check for code block boundaries
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip lines inside code blocks
    if (inCodeBlock) {
      continue;
    }

    // Match heading syntax
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match?.[1] && match[2]) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: lineNumber,
      });
    }
  }

  return headings;
}
