import { existsSync } from "node:fs";
import type { FileNotFound } from "../../domain/models/check-result.js";
import { findFilesByPattern } from "../adapters/glob.adapter.js";

/**
 * File validation service
 * Handles file existence checks and glob pattern expansion
 */
export class FileValidator {
  /**
   * Validate source file exists
   */
  validateSourceFile(sourcePath: string): void {
    if (!existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
  }

  /**
   * Expand target pattern and validate files
   * Returns array of target file paths and any validation errors
   */
  async expandAndValidateTargets(targetPattern: string): Promise<{
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
          suggestion: `No files found matching pattern: ${targetPattern}. Check if the pattern is correct`,
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
          suggestion: `Target file ${targetFile} not found. Create the file or check the path`,
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
}
