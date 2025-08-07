/**
 * Types for check results
 */

// Error type definitions
export type ErrorType =
  | "line-count"
  | "section-count"
  | "section-structure"
  | "section-position"
  | "section-title"
  | "code-block"
  | "file-not-found";

// Base interface for all errors (internal use only)
interface BaseError {
  type: ErrorType;
  file: string;
}

// Line count error
export interface LineCountError extends BaseError {
  type: "line-count";
  counts: {
    expected: number;
    actual: number;
  };
}

// Section count error
export interface SectionCountError extends BaseError {
  type: "section-count";
  counts: {
    expected: number;
    actual: number;
  };
  firstDifference?: {
    position: number;
    expectedSection?: string;
    actualSection?: string;
    previousSection?: string;
  };
}

// Section structure error
export interface SectionStructureError extends BaseError {
  type: "section-structure";
  position: number;
  expected: { level: number; index: number };
  actual: { level: number; text: string; line?: number };
}

// Section position error
export interface SectionPositionError extends BaseError {
  type: "section-position";
  section: string;
  expected: number;
  actual: number;
  previousSection?: {
    text: string;
    line: number;
  };
}

// Section title error
export interface SectionTitleError extends BaseError {
  type: "section-title";
  line: number;
  expected: string;
  actual: string;
}

// Code block error
export interface CodeBlockError extends BaseError {
  type: "code-block";
  line?: number;
  expected: string;
  actual: string;
  section?: string;
}

// File not found error
export interface FileNotFound extends BaseError {
  type: "file-not-found";
  pattern?: string;
}

// Union type for all translation errors
export type TranslationError =
  | LineCountError
  | SectionCountError
  | SectionStructureError
  | SectionPositionError
  | SectionTitleError
  | CodeBlockError
  | FileNotFound;

// Check configuration used during the check
export interface CheckConfig {
  source: string;
  target: string;
  checks: {
    skip: {
      sectionStructure: boolean;
      sectionPosition: boolean;
      lineCount: boolean;
    };
    require: {
      originalSectionTitles: boolean;
      originalCodeBlocks: boolean;
    };
  };
  output: {
    json: boolean;
  };
}

export interface CheckResult {
  isValid: boolean;
  errors: TranslationError[];
  config: CheckConfig;
  summary: {
    source: string;
    checkedFiles: string[];
    passedFiles: string[];
    failedFiles: string[];
  };
}
