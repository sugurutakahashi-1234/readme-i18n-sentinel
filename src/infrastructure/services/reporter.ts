import type {
  CheckResult,
  ErrorItem,
} from "../../domain/models/check-result.js";

/**
 * Format check result as human-readable text
 */
function formatText(result: CheckResult): string {
  if (result.isValid) {
    return "✅ All translations are up to date";
  }

  const lines: string[] = [];
  const errorsByFile = new Map<string, ErrorItem[]>();

  // Group errors by file
  for (const error of result.errors) {
    const fileErrors = errorsByFile.get(error.file) || [];
    fileErrors.push(error);
    errorsByFile.set(error.file, fileErrors);
  }

  // Format errors for each file
  for (const [file, errors] of errorsByFile) {
    for (const error of errors) {
      switch (error.type) {
        case "lines-mismatch":
          lines.push(`❌ ${file}: ${error.details || "Line count mismatch"}`);
          break;
        case "line-missing":
          lines.push(`❌ ${file}: Line ${error.line} not updated`);
          break;
        case "headings-mismatch":
          if (error.heading) {
            lines.push(`❌ ${file}: Heading mismatch => "${error.heading}"`);
          } else {
            lines.push(`❌ ${file}: ${error.details || "Heading mismatch"}`);
          }
          break;
      }
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
