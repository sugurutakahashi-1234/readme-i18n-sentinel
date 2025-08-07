import { diffLines } from "diff";

/**
 * Service for formatting text differences
 * Encapsulates the diff library functionality
 */
class DiffFormatter {
  /**
   * Split content into lines properly handling trailing newlines
   */
  private splitLines(content: string): string[] {
    const lines = content.split("\n");

    // Remove only the last empty line that comes from split
    // (when string ends with \n, split creates an extra empty element)
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    return lines;
  }

  /**
   * Format lines with a prefix
   */
  private formatLinesWithPrefix(lines: string[], prefix: string): string[] {
    return lines.map((line) => `${prefix}${line}`);
  }

  /**
   * Format differences between two text blocks
   * @param expected - The expected text
   * @param actual - The actual text
   * @returns Array of formatted diff lines
   */
  formatDiff(expected: string, actual: string): string[] {
    const lines: string[] = [];
    const changes = diffLines(expected, actual);

    for (const change of changes) {
      const changeLines = this.splitLines(change.value);

      let prefix: string;
      if (change.added) {
        prefix = "+ ";
      } else if (change.removed) {
        prefix = "- ";
      } else {
        prefix = "  ";
      }

      const formattedLines = this.formatLinesWithPrefix(changeLines, prefix);
      lines.push(...formattedLines);
    }

    return lines;
  }

  /**
   * Format missing content (content that should exist but doesn't)
   * @param content - The missing content
   * @returns Array of formatted lines showing what's missing
   */
  formatMissing(content: string): string[] {
    const contentLines = this.splitLines(content);
    return this.formatLinesWithPrefix(contentLines, "- ");
  }

  /**
   * Format unexpected content (content that shouldn't exist but does)
   * @param content - The unexpected content
   * @returns Array of formatted lines showing what's unexpected
   */
  formatUnexpected(content: string): string[] {
    const contentLines = this.splitLines(content);
    return this.formatLinesWithPrefix(contentLines, "+ ");
  }
}

// Export a singleton instance for better performance
export const diffFormatter = new DiffFormatter();
