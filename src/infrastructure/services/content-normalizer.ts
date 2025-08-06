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
  // Remove trailing newline and count lines
  // This provides a more intuitive line count
  const trimmedContent = normalized.trimEnd();
  if (trimmedContent === "") {
    return 0; // Empty file has 0 lines
  }
  return trimmedContent.split("\n").length;
}
