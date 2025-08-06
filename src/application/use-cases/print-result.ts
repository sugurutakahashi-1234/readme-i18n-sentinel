import type { CheckResult } from "../../domain/models/check-result.js";
import { formatErrorType } from "../../domain/services/error-formatter.js";

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
        error.lineNumber
      ) {
        errorHeader += ` (line ${error.lineNumber})`;
      }
      lines.push(errorHeader);

      switch (error.type) {
        case "line-count-mismatch": {
          lines.push(
            `  Expected: ${error.expected} lines | Found: ${error.actual} lines`,
          );
          lines.push(`  → ${error.suggestion}`);
          break;
        }
        case "outdated-line": {
          // Show simple diff if both contents are available
          if (error.expectedContent && error.currentContent !== undefined) {
            // Simple before/after display
            lines.push(`  - ${error.currentContent}`);
            lines.push(`  + ${error.expectedContent}`);
          } else if (error.expectedContent) {
            lines.push(`  Expected: "${error.expectedContent}"`);
            if (error.currentContent !== undefined) {
              lines.push(`  Current: "${error.currentContent}"`);
            }
          }
          lines.push(`  → ${error.suggestion}`);
          break;
        }
        case "missing-heading": {
          lines.push(
            `  Missing: "${"#".repeat(error.level)} ${error.heading}"`,
          );
          lines.push(`  → ${error.suggestion}`);
          break;
        }
        case "heading-mismatch": {
          lines.push(
            `  Expected: "${"#".repeat(error.expected.level)} ${error.expected.text}"`,
          );
          lines.push(
            `  Found: "${"#".repeat(error.actual.level)} ${error.actual.text}"`,
          );
          lines.push(`  → ${error.suggestion}`);
          break;
        }
        case "heading-count-mismatch": {
          lines.push(
            `  Expected: ${error.expected} headings | Found: ${error.actual} headings`,
          );
          lines.push(`  → ${error.suggestion}`);
          break;
        }
        case "file-not-found": {
          lines.push(`  → ${error.suggestion}`);
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
