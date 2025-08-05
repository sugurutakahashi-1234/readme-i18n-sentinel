import type { CheckResult } from "../../domain/models/check-result.js";

/**
 * Format check result as human-readable text
 */
function formatText(result: CheckResult): string {
  if (result.isValid) {
    return "✅ All translations are up to date";
  }

  const lines: string[] = [];

  // Add header
  if (result.summary && result.summary.affectedFiles.length > 0) {
    const files = result.summary.affectedFiles.join(", ");
    lines.push(`❌ Translation check failed for ${files}\n`);
  }

  // Format each error
  for (const error of result.errors) {
    switch (error.type) {
      case "line-count-mismatch": {
        lines.push(
          `Line count mismatch: expected ${error.expected} lines, found ${error.actual} lines`,
        );
        lines.push(`  → ${error.suggestion}`);
        break;
      }
      case "outdated-line": {
        lines.push(`Outdated line ${error.lineNumber}:`);
        if (error.expectedContent) {
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
          `Missing heading: "${"#".repeat(error.level)} ${error.heading}" (level ${error.level})`,
        );
        lines.push(`  → ${error.suggestion}`);
        break;
      }
      case "heading-mismatch": {
        lines.push(`Heading mismatch at line ${error.lineNumber}:`);
        lines.push(
          `  Expected: "${"#".repeat(error.expected.level)} ${error.expected.text}"`,
        );
        lines.push(
          `  Actual: "${"#".repeat(error.actual.level)} ${error.actual.text}"`,
        );
        lines.push(`  → ${error.suggestion}`);
        break;
      }
      case "heading-count-mismatch": {
        lines.push(
          `Heading count mismatch: expected ${error.expected} headings, found ${error.actual} headings`,
        );
        lines.push(`  → ${error.suggestion}`);
        break;
      }
    }
    lines.push(""); // Add blank line between errors
  }

  // Add summary
  if (result.summary) {
    lines.push(`Summary: ${result.summary.totalErrors} errors found`);
    lines.push(`  → ${result.summary.suggestion}`);
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
 * Print result to console
 */
export function printResult(result: CheckResult, asJson: boolean): void {
  if (asJson) {
    console.log(formatJson(result));
  } else {
    const formatted = formatText(result);
    // Use stderr for human-readable output
    console.error(formatted);
  }
}
