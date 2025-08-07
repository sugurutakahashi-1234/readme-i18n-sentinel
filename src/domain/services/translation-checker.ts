import type {
  CodeBlockError,
  LineCountError,
  SectionCountError,
  SectionPositionError,
  SectionStructureError,
  SectionTitleError,
  TranslationError,
} from "../models/check-result.js";
import type { Heading } from "../models/heading.js";

/**
 * Format heading with level markers (e.g., "## Section Title")
 */
function formatHeadingWithLevel(heading: Heading): string {
  return `${"#".repeat(heading.level)} ${heading.text}`;
}

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

    // Find first difference to help locate the issue
    const minLength = Math.min(sourceHeadings.length, targetHeadings.length);

    // Check common sections for differences
    for (let i = 0; i < minLength; i++) {
      const source = sourceHeadings[i];
      const target = targetHeadings[i];
      if (source && target && source.text !== target.text) {
        const prev = i > 0 ? targetHeadings[i - 1] : undefined;
        const prevSection = prev ? formatHeadingWithLevel(prev) : undefined;
        error.firstDifference = {
          position: i + 1,
          expectedSection: formatHeadingWithLevel(source),
          actualSection: formatHeadingWithLevel(target),
          ...(prevSection && { previousSection: prevSection }),
        };
        break;
      }
    }

    // If all common sections match, the difference is at the end
    if (
      !error.firstDifference &&
      sourceHeadings.length !== targetHeadings.length
    ) {
      const position = minLength + 1;
      const expectedHeading = sourceHeadings[minLength];
      const actualHeading = targetHeadings[minLength];
      const prevHeading =
        minLength > 0 ? targetHeadings[minLength - 1] : undefined;

      const expectedSection = expectedHeading
        ? formatHeadingWithLevel(expectedHeading)
        : undefined;
      const actualSection = actualHeading
        ? formatHeadingWithLevel(actualHeading)
        : undefined;
      const prevSection = prevHeading
        ? formatHeadingWithLevel(prevHeading)
        : undefined;

      // Only set firstDifference if we have at least one section to show
      if (expectedSection || actualSection) {
        error.firstDifference = {
          position,
          ...(expectedSection && { expectedSection }),
          ...(actualSection && { actualSection }),
          ...(prevSection && { previousSection: prevSection }),
        };
      }
    }

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
          text: formatHeadingWithLevel(targetHeading),
          line: targetHeading.line,
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
        section: formatHeadingWithLevel(sourceHeading),
        expected: sourceHeading.line,
        actual: targetHeading.line,
      };

      // Add previous section info to help locate the issue
      if (i > 0) {
        const prevHeading = targetHeadings[i - 1];
        if (prevHeading) {
          error.previousSection = {
            text: formatHeadingWithLevel(prevHeading),
            line: prevHeading.line,
          };
        }
      }

      errors.push(error);
      return errors; // Early return on first mismatch to avoid cascading errors
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
        expected: formatHeadingWithLevel(sourceHeading),
        actual: formatHeadingWithLevel(targetHeading),
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

    // Check for code block boundaries (including indented ones)
    if (line.trim().startsWith("```")) {
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

/**
 * Represents a code block found in the content
 */
interface CodeBlock {
  content: string; // Full content including ``` markers
  line: number; // Starting line number
  section?: string; // The section this code block belongs to
}

/**
 * Extract code blocks from file content
 */
export function extractCodeBlocks(
  content: string,
  headings: Heading[],
): CodeBlock[] {
  const lines = content.split("\n");
  const codeBlocks: CodeBlock[] = [];
  let inCodeBlock = false;
  let currentBlock: string[] = [];
  let blockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const lineNumber = i + 1;

    // Check for code block boundaries (including indented ones)
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        blockStartLine = lineNumber;
        currentBlock = [line];
      } else {
        // End of code block
        currentBlock.push(line);
        const blockContent = currentBlock.join("\n");

        // Find the section this code block belongs to
        let section: string | undefined;
        for (let j = headings.length - 1; j >= 0; j--) {
          const heading = headings[j];
          if (heading && heading.line < blockStartLine) {
            section = formatHeadingWithLevel(heading);
            break;
          }
        }

        codeBlocks.push({
          content: blockContent,
          line: blockStartLine,
          ...(section !== undefined && { section }),
        });

        inCodeBlock = false;
        currentBlock = [];
      }
    } else if (inCodeBlock) {
      // Inside code block, add all lines (including empty ones)
      currentBlock.push(line);
    }
  }

  return codeBlocks;
}

/**
 * Check if code blocks match exactly
 */
export function checkCodeBlockMatch(
  sourceBlocks: CodeBlock[],
  targetBlocks: CodeBlock[],
  targetFile: string,
): CodeBlockError[] {
  const errors: CodeBlockError[] = [];

  // Check each code block
  const minLength = Math.min(sourceBlocks.length, targetBlocks.length);
  for (let i = 0; i < minLength; i++) {
    const sourceBlock = sourceBlocks[i];
    const targetBlock = targetBlocks[i];

    if (!sourceBlock || !targetBlock) {
      continue;
    }

    // Check if content matches exactly
    if (sourceBlock.content !== targetBlock.content) {
      const error: CodeBlockError = {
        type: "code-block",
        file: targetFile,
        line: targetBlock.line,
        expected: sourceBlock.content,
        actual: targetBlock.content,
        ...(targetBlock.section !== undefined && {
          section: targetBlock.section,
        }),
      };
      errors.push(error);
    }
  }

  // If block counts differ, report a single error for the first difference
  if (sourceBlocks.length !== targetBlocks.length) {
    if (sourceBlocks.length > targetBlocks.length) {
      // Missing blocks in target
      const sourceBlock = sourceBlocks[targetBlocks.length];
      if (sourceBlock) {
        const error: CodeBlockError = {
          type: "code-block",
          file: targetFile,
          // Don't set line for missing blocks
          expected: sourceBlock.content,
          actual: "", // Missing block
          ...(sourceBlock.section !== undefined && {
            section: sourceBlock.section,
          }),
        };
        errors.push(error);
      }
    } else {
      // Extra blocks in target
      const targetBlock = targetBlocks[sourceBlocks.length];
      if (targetBlock) {
        const error: CodeBlockError = {
          type: "code-block",
          file: targetFile,
          line: targetBlock.line,
          expected: "", // No corresponding block in source
          actual: targetBlock.content,
          ...(targetBlock.section !== undefined && {
            section: targetBlock.section,
          }),
        };
        errors.push(error);
      }
    }
  }

  return errors;
}
