/**
 * Text normalization functions
 *
 * Normalizes text to reduce false positives in comparisons
 */

/**
 * Normalize line endings and whitespace
 */
export function normalizeContent(content: string): string {
  return (
    content
      // Normalize line endings to LF
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Remove trailing whitespace from each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      // Ensure single newline at end of file
      .replace(/\n*$/, "\n")
  );
}

/**
 * Count normalized lines
 */
export function countLines(content: string): number {
  const normalized = normalizeContent(content);
  return normalized.split("\n").length - 1; // -1 because of trailing newline
}
