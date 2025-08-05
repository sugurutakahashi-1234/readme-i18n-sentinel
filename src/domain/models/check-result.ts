/**
 * Types for check results
 */

type ErrorType = "lines-mismatch" | "line-missing" | "headings-mismatch";

export interface ErrorItem {
  file: string;
  type: ErrorType;
  line?: number;
  heading?: string;
  details?: string;
}

export interface CheckResult {
  isValid: boolean;
  errors: ErrorItem[];
}
