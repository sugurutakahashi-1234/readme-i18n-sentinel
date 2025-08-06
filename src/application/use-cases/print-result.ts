import type {
  CheckResult,
  TranslationError,
} from "../../domain/models/check-result.js";

/**
 * Format error type for display
 */
function formatErrorType(type: string): string {
  switch (type) {
    case "line-count":
      return "Line count mismatch";
    case "section-count":
      return "Section count mismatch";
    case "section-structure":
      return "Section structure mismatch";
    case "section-position":
      return "Section position mismatch";
    case "section-title":
      return "Section title mismatch";
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
    case "line-count": {
      const difference = error.counts.expected - error.counts.actual;
      return difference > 0
        ? `Add ${difference} lines to match the source file`
        : `Remove ${Math.abs(difference)} lines to match the source file`;
    }
    case "section-count": {
      const difference = error.counts.expected - error.counts.actual;
      return difference > 0
        ? `Add ${difference} sections to match the source structure. Check which sections are missing and add them in the correct order.`
        : `Remove ${Math.abs(
            difference,
          )} extra sections to match the source structure.`;
    }
    case "section-structure":
      return `Section at position ${error.position} has wrong level. Expected level ${error.expected.level}, found level ${error.actual.level}`;
    case "section-position": {
      const diff = error.actual - error.expected;
      const direction = diff > 0 ? "below" : "above";
      return `Section "${error.section}" expected at line ${error.expected}, found at line ${error.actual} (${Math.abs(diff)} lines ${direction})`;
    }
    case "section-title":
      return `Section title at line ${error.line} should be "${error.expected}" but found "${error.actual}". Keep titles in the source language for URL anchors`;
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
      if (error.type === "section-title" && error.line) {
        errorHeader += ` (line ${error.line})`;
      }
      lines.push(errorHeader);

      switch (error.type) {
        case "line-count": {
          lines.push(
            `  Expected: ${error.counts.expected} lines | Found: ${error.counts.actual} lines`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "section-count": {
          lines.push(
            `  Expected: ${error.counts.expected} sections | Found: ${error.counts.actual} sections`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "section-structure": {
          lines.push(`  Position: ${error.position}`);
          lines.push(
            `  Expected level: ${error.expected.level} | Found level: ${error.actual.level}`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "section-position": {
          lines.push(
            `  Expected line: ${error.expected} | Found line: ${error.actual}`,
          );
          lines.push(`  → ${generateSuggestion(error)}`);
          break;
        }
        case "section-title": {
          lines.push(`  Expected: "${error.expected}"`);
          lines.push(`  Found: "${error.actual}"`);
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
