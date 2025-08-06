import type { TranslationError } from "../models/check-result.js";

/**
 * Error formatting service
 * Centralizes error message generation
 */

/**
 * Format suggestion message based on error type
 */
export function formatSuggestion(error: TranslationError): string {
  switch (error.type) {
    case "line-count-mismatch": {
      const { difference } = error;
      return difference > 0
        ? `Add ${difference} lines to match the source file`
        : `Remove ${Math.abs(difference)} lines to match the source file`;
    }
    case "outdated-line":
      return `Please translate the updated content from line ${error.lineNumber}`;
    case "missing-heading":
      return `Add heading "${"#".repeat(error.level)} ${
        error.heading
      }" to match the source structure`;
    case "heading-mismatch":
      return `Replace "${"#".repeat(error.actual.level)} ${
        error.actual.text
      }" with "${"#".repeat(error.expected.level)} ${
        error.expected.text
      }" at line ${error.lineNumber}`;
    case "heading-count-mismatch": {
      const { difference } = error;
      return difference > 0
        ? `Add ${difference} headings to match the source structure. Check which headings are missing and add them in the correct order.`
        : `Remove ${Math.abs(
            difference,
          )} extra headings to match the source structure.`;
    }
    case "file-not-found":
      return error.suggestion || "File not found";
    default:
      return "Fix the issue to match the source file";
  }
}

/**
 * Format error type for display
 */
export function formatErrorType(type: string): string {
  switch (type) {
    case "outdated-line":
      return "Translation outdated";
    case "line-count-mismatch":
      return "Line count mismatch";
    case "heading-mismatch":
      return "Heading mismatch";
    case "heading-count-mismatch":
      return "Heading count mismatch";
    case "missing-heading":
      return "Missing heading";
    case "file-not-found":
      return "File not found";
    default:
      return type;
  }
}
