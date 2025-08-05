import type { ErrorItem } from "../models/check-result.js";

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
): ErrorItem | null {
  if (sourceLineCount !== targetLineCount) {
    return {
      file: targetFile,
      type: "lines-mismatch",
      details: `Line count mismatch: source has ${sourceLineCount} lines, target has ${targetLineCount} lines`,
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
): ErrorItem[] {
  const errors: ErrorItem[] = [];
  const targetChangedSet = new Set(targetChangedLines);

  for (const line of sourceChangedLines) {
    if (!targetChangedSet.has(line)) {
      errors.push({
        file: targetFile,
        type: "line-missing",
        line,
        details: `Line ${line} was changed in source but not in target`,
      });
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
): ErrorItem[] {
  const errors: ErrorItem[] = [];

  // Check if the number of headings match
  if (sourceHeadings.length !== targetHeadings.length) {
    errors.push({
      file: targetFile,
      type: "headings-mismatch",
      details: `Heading count mismatch: source has ${sourceHeadings.length} headings, target has ${targetHeadings.length} headings`,
    });
    return errors;
  }

  // Check each heading
  for (let i = 0; i < sourceHeadings.length; i++) {
    const sourceHeading = sourceHeadings[i];
    const targetHeading = targetHeadings[i];

    if (!sourceHeading || !targetHeading) {
      continue; // This should not happen if length check passed
    }

    if (
      sourceHeading.level !== targetHeading.level ||
      sourceHeading.text !== targetHeading.text
    ) {
      errors.push({
        file: targetFile,
        type: "headings-mismatch",
        heading: sourceHeading.text,
        line: targetHeading.line,
        details: `Heading mismatch at line ${targetHeading.line}: expected "${sourceHeading.text}" (level ${sourceHeading.level}), found "${targetHeading.text}" (level ${targetHeading.level})`,
      });
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
