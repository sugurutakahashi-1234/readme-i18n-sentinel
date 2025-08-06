import type {
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";

/**
 * Format error type for display
 */
function formatErrorType(type: string): string {
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

/**
 * Generate suggestion message based on error type
 */
function generateSuggestion(error: TranslationError): string {
  switch (error.type) {
    case "line-count-mismatch": {
      const difference = error.counts.expected - error.counts.actual;
      return difference > 0
        ? `Add ${difference} lines to match the source file`
        : `Remove ${Math.abs(difference)} lines to match the source file`;
    }
    case "outdated-line":
      return `Please translate the updated content from line ${error.line}`;
    case "missing-heading":
      return `Add heading "${"#".repeat(error.heading.level)} ${
        error.heading.text
      }" to match the source structure`;
    case "heading-mismatch":
      return `Replace "${"#".repeat(error.heading.actual.level)} ${
        error.heading.actual.text
      }" with "${"#".repeat(error.heading.expected.level)} ${
        error.heading.expected.text
      }" at line ${error.line}`;
    case "heading-count-mismatch": {
      const difference = error.counts.expected - error.counts.actual;
      return difference > 0
        ? `Add ${difference} headings to match the source structure. Check which headings are missing and add them in the correct order.`
        : `Remove ${Math.abs(
            difference,
          )} extra headings to match the source structure.`;
    }
    case "file-not-found":
      if (error.pattern) {
        return `No files found matching pattern: ${error.pattern}. Check if the pattern is correct`;
      }
      return `Target file ${error.file} not found. Create the file or check the path`;
    default:
      return "Fix the issue to match the source file";
  }
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
        (error.type === "outdated-line" || error.type === "heading-mismatch") &&
        error.line
      ) {
        errorHeader += ` (line ${error.line})`;
      }
      lines.push(errorHeader);

      switch (error.type) {
        case "line-count-mismatch": {
          lines.push(
            `  Expected: ${error.counts.expected} lines | Found: ${error.counts.actual} lines`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "outdated-line": {
          // Show simple diff if both contents are available
          if (error.content.expected && error.content.current !== undefined) {
            // Simple before/after display
            lines.push(`  - ${error.content.current}`);
            lines.push(`  + ${error.content.expected}`);
          } else if (error.content.expected) {
            lines.push(`  Expected: "${error.content.expected}"`);
            if (error.content.current !== undefined) {
              lines.push(`  Current: "${error.content.current}"`);
            }
          }
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "missing-heading": {
          lines.push(
            `  Missing: "${"#".repeat(error.heading.level)} ${error.heading.text}"`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "heading-mismatch": {
          lines.push(
            `  Expected: "${"#".repeat(error.heading.expected.level)} ${error.heading.expected.text}"`,
          );
          lines.push(
            `  Found: "${"#".repeat(error.heading.actual.level)} ${error.heading.actual.text}"`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "heading-count-mismatch": {
          lines.push(
            `  Expected: ${error.counts.expected} headings | Found: ${error.counts.actual} headings`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "file-not-found": {
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
      }

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
