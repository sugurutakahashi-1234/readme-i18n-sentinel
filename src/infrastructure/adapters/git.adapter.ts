import { type SimpleGit, simpleGit } from "simple-git";
import { GitOperationError } from "../../domain/models/errors.js";

export class GitAdapter {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir);
  }

  /**
   * Check if we're in a git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get changed lines from git diff
   * Returns line numbers that have been added or modified
   */
  async getChangedLines(filePath: string): Promise<number[]> {
    try {
      // Get unified diff with 0 context lines for both staged and unstaged changes
      const stagedDiff = await this.git.diff([
        "--cached",
        "--unified=0",
        "--",
        filePath,
      ]);
      const unstagedDiff = await this.git.diff(["--unified=0", "--", filePath]);

      const stagedLines = this.parseChangedLinesFromDiff(stagedDiff);
      const unstagedLines = this.parseChangedLinesFromDiff(unstagedDiff);

      // Combine and deduplicate line numbers
      const allLines = new Set([...stagedLines, ...unstagedLines]);
      return Array.from(allLines).sort((a, b) => a - b);
    } catch (error) {
      throw new GitOperationError(
        `Failed to get git diff for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        `git diff --unified=0 -- ${filePath}`,
      );
    }
  }

  /**
   * Parse changed line numbers from unified diff output
   */
  private parseChangedLinesFromDiff(diff: string): number[] {
    const changedLines: number[] = [];
    const lines = diff.split("\n");

    for (const line of lines) {
      // Match diff hunk headers like "@@ -1,3 +1,4 @@"
      const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      if (match?.[1]) {
        const startLine = parseInt(match[1], 10);
        const lineCount = match[2] ? parseInt(match[2], 10) : 1;

        // Add all lines in the hunk
        for (let i = 0; i < lineCount; i++) {
          changedLines.push(startLine + i);
        }
      }
    }

    return changedLines;
  }
}
