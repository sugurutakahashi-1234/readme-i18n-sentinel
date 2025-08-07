import type {
  CheckResult,
  ErrorType,
  TranslationError,
} from "../../domain/models/check-result.js";
import {
  formatDiff,
  formatMissing,
  formatUnexpected,
} from "../../infrastructure/services/diff-formatter.js";

/**
 * Error type display labels
 */
const ERROR_TYPE_LABELS = {
  "line-count": "Line count mismatch",
  "section-count": "Section count mismatch",
  "section-structure": "Section structure mismatch",
  "section-position": "Section position mismatch",
  "section-title": "Section title mismatch",
  "code-block": "Code block mismatch",
  "file-not-found": "File not found",
} as const satisfies Record<ErrorType, string>;

/**
 * Format error type for display
 */
function formatErrorType(type: ErrorType): string {
  return ERROR_TYPE_LABELS[type];
}

/**
 * Generate suggestion message based on error type
 */
function generateSuggestion(error: TranslationError): string {
  switch (error.type) {
    case "line-count": {
      const difference = error.counts.expected - error.counts.actual;
      return difference > 0
        ? `Add ${difference} lines to match the source file`
        : `Remove ${Math.abs(difference)} lines to match the source file`;
    }

    case "section-count": {
      const difference = error.counts.expected - error.counts.actual;
      const baseMessage =
        difference > 0
          ? `Add ${difference} sections to match the source structure`
          : `Remove ${Math.abs(difference)} extra sections to match the source structure`;

      // Add specific hint if available
      if (error.firstDifference) {
        if (difference > 0 && error.firstDifference.expectedSection) {
          let message = `${baseMessage}. Missing: "${error.firstDifference.expectedSection}"`;
          if (error.firstDifference.previousSection) {
            message += ` after "${error.firstDifference.previousSection}"`;
          }
          return message;
        } else if (difference < 0 && error.firstDifference.actualSection) {
          let message = `${baseMessage}. Extra: "${error.firstDifference.actualSection}"`;
          if (error.firstDifference.previousSection) {
            message += ` after "${error.firstDifference.previousSection}"`;
          }
          return message;
        }
      }

      return `${baseMessage}. Check which sections are missing and add them in the correct order.`;
    }

    case "section-structure": {
      let message = `Section "${error.actual.text}" at position ${error.position}`;
      if (error.actual.line) {
        message += ` (line ${error.actual.line})`;
      }
      message += ` has wrong level. Expected level ${error.expected.level}, found level ${error.actual.level}`;
      return message;
    }

    case "section-position": {
      const diff = error.actual - error.expected;
      const direction = diff > 0 ? "below" : "above";
      return `Section "${error.section}" expected at line ${error.expected}, found at line ${error.actual} (${Math.abs(diff)} lines ${direction})`;
    }

    case "section-title":
      return `Section title at line ${error.line} should be "${error.expected}" but found "${error.actual}". Keep titles in the source language for URL anchors`;

    case "code-block": {
      const lines = error.expected.split("\n");
      const isMultiLine = lines.length > 1;
      const preview = isMultiLine ? `${lines[0]}...` : error.expected;

      if (error.actual === "") {
        return `Missing code block at expected position. Expected: "${preview}"`;
      } else if (error.expected === "") {
        const actualLines = error.actual.split("\n");
        const actualPreview =
          actualLines.length > 1 ? `${actualLines[0]}...` : error.actual;
        const lineInfo = error.line ? ` at line ${error.line}` : "";
        return `Unexpected code block${lineInfo}. Found: "${actualPreview}"`;
      } else {
        const lineInfo = error.line ? ` at line ${error.line}` : "";
        return `Code block${lineInfo} does not match exactly. Ensure code blocks are identical in all translations`;
      }
    }

    case "file-not-found":
      if (error.pattern) {
        return `No files found matching pattern: ${error.pattern}. Check if the pattern is correct`;
      }
      return `Target file ${error.file} not found. Create the file or check the path`;

    default: {
      // Exhaustive check - ensures all cases are handled
      const _exhaustive: never = error;
      void _exhaustive;
      throw new Error(`Unhandled error type`);
    }
  }
}

/**
 * Format error details
 */
function formatErrorDetails(error: TranslationError): string[] {
  const lines: string[] = [];

  switch (error.type) {
    case "line-count":
      lines.push(
        `  Expected: ${error.counts.expected} lines | Found: ${error.counts.actual} lines`,
      );
      lines.push(`  → ${generateSuggestion(error)}`);
      break;

    case "section-count":
      lines.push(
        `  Expected: ${error.counts.expected} sections | Found: ${error.counts.actual} sections`,
      );
      lines.push(`  → ${generateSuggestion(error)}`);

      // Show helpful context if available
      if (error.firstDifference?.previousSection) {
        lines.push(
          `  💡 Check the area after "${error.firstDifference.previousSection}"`,
        );
      }
      break;

    case "section-structure": {
      lines.push(`  Position: ${error.position}`);

      // Show section name and line if available
      if (error.actual.line) {
        lines.push(
          `  Section: "${error.actual.text}" at line ${error.actual.line}`,
        );
      } else {
        lines.push(`  Section: "${error.actual.text}"`);
      }

      const expectedLevel = "#".repeat(error.expected.level);
      const actualLevel = "#".repeat(error.actual.level);
      lines.push(
        `  Expected: ${expectedLevel} (level ${error.expected.level}) | Found: ${actualLevel} (level ${error.actual.level})`,
      );
      lines.push(`  → ${generateSuggestion(error)}`);
      break;
    }

    case "section-position":
      lines.push(
        `  Expected line: ${error.expected} | Found line: ${error.actual}`,
      );
      lines.push(`  → ${generateSuggestion(error)}`);

      // Show previous section info to help locate the issue
      if (error.previousSection) {
        lines.push(
          `  💡 Check area after previous section "${error.previousSection.text}" (line ${error.previousSection.line})`,
        );
      }
      break;

    case "section-title":
      lines.push(`  Expected: "${error.expected}"`);
      lines.push(`  Found: "${error.actual}"`);
      lines.push(`  → ${generateSuggestion(error)}`);
      break;

    case "code-block": {
      if (error.section) {
        lines.push(`  In section: ${error.section}`);
      }

      // Show diff between expected and actual
      if (error.expected && error.actual) {
        lines.push(`  Diff:`);
        const diffLines = formatDiff(error.expected, error.actual);
        for (const line of diffLines) {
          lines.push(`  ${line}`);
        }
      } else if (error.expected) {
        // Missing block in target
        lines.push(`  Missing code block:`);
        const missingLines = formatMissing(error.expected);
        for (const line of missingLines) {
          lines.push(`  ${line}`);
        }
      } else if (error.actual) {
        // Extra block in target
        lines.push(`  Unexpected code block:`);
        const unexpectedLines = formatUnexpected(error.actual);
        for (const line of unexpectedLines) {
          lines.push(`  ${line}`);
        }
      }

      lines.push(`  → ${generateSuggestion(error)}`);
      break;
    }

    case "file-not-found":
      lines.push(`  → ${generateSuggestion(error)}`);
      break;

    default: {
      // Exhaustive check - ensures all cases are handled
      const _exhaustive: never = error;
      void _exhaustive;
      throw new Error(`Unhandled error type`);
    }
  }

  return lines;
}

/**
 * Format check result as human-readable text
 */
function formatText(result: CheckResult): string {
  if (result.isValid) {
    return "✅ All translations are up to date";
  }

  const lines: string[] = [];

  // Show error summary
  if (result.summary && result.summary.affectedFiles.length > 0) {
    lines.push(
      `❌ Found ${result.errors.length} issue${result.errors.length === 1 ? "" : "s"} in ${result.summary.affectedFiles.length} file${result.summary.affectedFiles.length === 1 ? "" : "s"}`,
    );
    lines.push("");
  }

  // Show detailed information for each error
  if (result.errors.length > 0) {
    for (let i = 0; i < result.errors.length; i++) {
      const error = result.errors[i];
      if (!error) continue;

      // Show error with file and type
      let errorHeader = `[${error.file}] ${formatErrorType(error.type)}`;
      if (
        (error.type === "section-title" || error.type === "code-block") &&
        error.line
      ) {
        errorHeader += ` (line ${error.line})`;
      }
      lines.push(errorHeader);

      // Format error details
      const detailLines = formatErrorDetails(error);
      lines.push(...detailLines);

      lines.push(""); // Empty line between errors
    }
  }

  return lines.join("\n");
}

/**
 * Format check result as JSON
 */
function formatJson(result: CheckResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Print result use case
 * Outputs the check result in the requested format
 */
export async function printResultUseCase(
  result: CheckResult,
  asJson: boolean,
): Promise<void> {
  if (asJson) {
    console.log(formatJson(result));
  } else {
    const formatted = formatText(result);
    console.log(formatted);
  }
}
