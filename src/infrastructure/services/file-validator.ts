import { existsSync } from "node:fs";
import type { FileNotFound } from "../../domain/models/check-result.js";
import { findFilesByPattern } from "../adapters/glob.adapter.js";

/**
 * Validate source file exists
 */
export function validateSourceFile(sourcePath: string): void {
  if (!existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }
}

/**
 * Expand target pattern and validate files
 * Returns array of target file paths and any validation errors
 */
export async function expandAndValidateTargets(targetPattern: string): Promise<{
  targetFiles: string[];
  errors: FileNotFound[];
}> {
  const errors: FileNotFound[] = [];
  let targetFiles: string[] = [];

  // Check if it's a glob pattern (contains *, ?, [, ], {, })
  if (/[*?[\]{}]/.test(targetPattern)) {
    const matchedFiles = await findFilesByPattern(targetPattern);
    if (matchedFiles.length === 0) {
      errors.push({
        type: "file-not-found",
        file: targetPattern,
        pattern: targetPattern,
      });
    } else {
      targetFiles = matchedFiles;
    }
  } else {
    // It's a literal file path
    targetFiles = [targetPattern];
  }

  // Check each target file exists
  const validFiles: string[] = [];
  for (const targetFile of targetFiles) {
    if (!existsSync(targetFile)) {
      errors.push({
        type: "file-not-found",
        file: targetFile,
      });
    } else {
      validFiles.push(targetFile);
    }
  }

  return {
    targetFiles: validFiles,
    errors,
  };
}
