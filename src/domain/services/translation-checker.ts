import type {
  LineCountError,
  SectionCountError,
  SectionPositionError,
  SectionStructureError,
  SectionTitleError,
  TranslationError,
} from "../models/check-result.js";
import type { Heading } from "../models/heading.js";

/**
 * Check if source and target files have the same number of lines
 */
export function checkLines(
  sourceLineCount: number,
  targetLineCount: number,
  targetFile: string,
): LineCountError | null {
  if (sourceLineCount !== targetLineCount) {
    const error: LineCountError = {
      type: "line-count",
      file: targetFile,
      counts: {
        expected: sourceLineCount,
        actual: targetLineCount,
      },
    };
    return error;
  }
  return null;
}

/**
 * Check section order and structure (count + hierarchy)
 */
export function checkSectionOrder(
  sourceHeadings: Heading[],
  targetHeadings: Heading[],
  targetFile: string,
): TranslationError[] {
  const errors: TranslationError[] = [];

  // Check if section count matches
  if (sourceHeadings.length !== targetHeadings.length) {
    const error: SectionCountError = {
      type: "section-count",
      file: targetFile,
      counts: {
        expected: sourceHeadings.length,
        actual: targetHeadings.length,
      },
    };
    errors.push(error);
    return errors; // Early return - no point checking structure if count differs
  }

  // Check order and level of each heading
  for (let i = 0; i < sourceHeadings.length; i++) {
    const sourceHeading = sourceHeadings[i];
    const targetHeading = targetHeadings[i];

    if (!sourceHeading || !targetHeading) {
      continue;
    }

    // Check if level (hierarchy) matches
    if (sourceHeading.level !== targetHeading.level) {
      const error: SectionStructureError = {
        type: "section-structure",
        file: targetFile,
        position: i + 1,
        expected: {
          level: sourceHeading.level,
          index: i,
        },
        actual: {
          level: targetHeading.level,
          text: targetHeading.text,
        },
      };
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if sections appear at the same line positions
 */
export function checkSectionLines(
  sourceHeadings: Heading[],
  targetHeadings: Heading[],
  targetFile: string,
): SectionPositionError[] {
  const errors: SectionPositionError[] = [];

  // Only check if counts match (assumes checkSectionOrder was called first)
  if (sourceHeadings.length !== targetHeadings.length) {
    return errors;
  }

  for (let i = 0; i < sourceHeadings.length; i++) {
    const sourceHeading = sourceHeadings[i];
    const targetHeading = targetHeadings[i];

    if (!sourceHeading || !targetHeading) {
      continue;
    }

    // Check if line position matches
    if (sourceHeading.line !== targetHeading.line) {
      const error: SectionPositionError = {
        type: "section-position",
        file: targetFile,
        section: `${"#".repeat(sourceHeading.level)} ${sourceHeading.text}`,
        expected: sourceHeading.line,
        actual: targetHeading.line,
      };
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if section titles match exactly (no translation allowed)
 */
export function checkSectionTitleMatch(
  sourceHeadings: Heading[],
  targetHeadings: Heading[],
  targetFile: string,
): SectionTitleError[] {
  const errors: SectionTitleError[] = [];

  // Only check if counts match (assumes checkSectionOrder was called first)
  if (sourceHeadings.length !== targetHeadings.length) {
    return errors;
  }

  for (let i = 0; i < sourceHeadings.length; i++) {
    const sourceHeading = sourceHeadings[i];
    const targetHeading = targetHeadings[i];

    if (!sourceHeading || !targetHeading) {
      continue;
    }

    // Check if title text matches exactly
    if (sourceHeading.text !== targetHeading.text) {
      const error: SectionTitleError = {
        type: "section-title",
        file: targetFile,
        line: targetHeading.line,
        expected: sourceHeading.text,
        actual: targetHeading.text,
      };
      errors.push(error);
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
