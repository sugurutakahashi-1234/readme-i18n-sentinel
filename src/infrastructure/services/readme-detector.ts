import { findFilesByPattern } from "../adapters/glob.adapter.js";

/**
 * Result of README file detection
 */
interface ReadmeDetectionResult {
  source: string | null;
  targets: string[];
}

/**
 * Automatically detect README files in the current directory
 *
 * Detection logic:
 * 1. Look for README.md as the source file
 * 2. Find all README.*.md files as targets
 * 3. Exclude the source file from targets
 *
 * @returns Detection result with source and target files
 */
export async function detectReadmeFiles(): Promise<ReadmeDetectionResult> {
  // Look for README files in current directory
  const readmeFiles = await findFilesByPattern("README*.md");

  // Find source file (README.md)
  const sourceFile = readmeFiles.find((file) => file === "README.md");

  if (!sourceFile) {
    return {
      source: null,
      targets: [],
    };
  }

  // Find target files (README.*.md)
  // Pattern: README followed by a dot and any characters, then .md
  const targetFiles = readmeFiles.filter((file) => {
    // Exclude source file
    if (file === sourceFile) return false;

    // Match pattern README.*.md (e.g., README.ja.md, README.zh-CN.md)
    const match = file.match(/^README\.[^/]+\.md$/);
    return match !== null;
  });

  return {
    source: sourceFile,
    targets: targetFiles,
  };
}

/**
 * Check if auto-detection should be used
 *
 * Auto-detection is used when:
 * - No source is specified via CLI
 *
 * @param hasCliSource - Whether source was specified via CLI
 * @returns Whether to use auto-detection
 */
export function shouldUseAutoDetection(hasCliSource: boolean): boolean {
  return !hasCliSource;
}
