/**
 * Types for check results
 */

// Base interface for all errors (internal use only)
interface BaseError {
  type: string;
  file: string;
}

// Line count mismatch error
export interface LineCountMismatch extends BaseError {
  type: "line-count-mismatch";
  counts: {
    expected: number;
    actual: number;
  };
}

// Outdated line error
export interface OutdatedLine extends BaseError {
  type: "outdated-line";
  line: number;
  content: {
    current?: string;
    expected: string;
  };
}

// Missing heading error
export interface MissingHeading extends BaseError {
  type: "missing-heading";
  heading: {
    level: number;
    text: string;
  };
}

// Heading mismatch error
export interface HeadingMismatch extends BaseError {
  type: "heading-mismatch";
  line: number;
  heading: {
    expected: { level: number; text: string };
    actual: { level: number; text: string };
  };
}

// Heading count mismatch error
export interface HeadingCountMismatch extends BaseError {
  type: "heading-count-mismatch";
  counts: {
    expected: number;
    actual: number;
  };
}

// File not found error
export interface FileNotFound extends BaseError {
  type: "file-not-found";
  pattern?: string;
}

// Union type for all translation errors
export type TranslationError =
  | LineCountMismatch
  | OutdatedLine
  | MissingHeading
  | HeadingMismatch
  | HeadingCountMismatch
  | FileNotFound;

// Check configuration used during the check
export interface CheckConfig {
  source: string;
  target: string;
  checks: {
    checkLineCount: boolean;
    checkChangedLines: boolean;
    strictHeadings: boolean;
  };
  output: {
    json: boolean;
  };
}

export interface CheckResult {
  isValid: boolean;
  errors: TranslationError[];
  config: CheckConfig;
  summary?: {
    totalErrors: number;
    affectedFiles: string[];
  };
}
