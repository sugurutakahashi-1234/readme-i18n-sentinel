import { globby } from "globby";

/**
 * Find files matching the glob pattern
 *
 * Uses globby to search for files with support for:
 * - Standard glob patterns (*, **, ?, etc.)
 * - Multiple patterns
 * - Negation patterns
 *
 * @param patterns - Single glob pattern or array of patterns
 * @returns Array of file paths matching the pattern(s)
 */
export async function findFilesByPattern(
  patterns: string | string[],
): Promise<string[]> {
  return await globby(patterns);
}
