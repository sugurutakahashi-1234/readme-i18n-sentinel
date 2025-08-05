/**
 * Types for check results
 */

// Base interface for all errors (internal use only)
interface BaseError {
  type: string;
  file: string;
  suggestion: string;
}

// Line count mismatch error
export interface LineCountMismatch extends BaseError {
  type: "line-count-mismatch";
  expected: number;
  actual: number;
  difference: number;
}

// Outdated line error
export interface OutdatedLine extends BaseError {
  type: "outdated-line";
  lineNumber: number;
  currentContent?: string;
  expectedContent: string;
}

// Missing heading error
export interface MissingHeading extends BaseError {
  type: "missing-heading";
  heading: string;
  level: number;
}

// Heading mismatch error
export interface HeadingMismatch extends BaseError {
  type: "heading-mismatch";
  lineNumber: number;
  expected: { level: number; text: string };
  actual: { level: number; text: string };
}

// Heading count mismatch error
export interface HeadingCountMismatch extends BaseError {
  type: "heading-count-mismatch";
  expected: number;
  actual: number;
  difference: number;
}

// Union type for all translation errors
export type TranslationError =
  | LineCountMismatch
  | OutdatedLine
  | MissingHeading
  | HeadingMismatch
  | HeadingCountMismatch;

export interface CheckResult {
  isValid: boolean;
  errors: TranslationError[];
  summary?: {
    totalErrors: number;
    affectedFiles: string[];
    suggestion: string;
  };
}
