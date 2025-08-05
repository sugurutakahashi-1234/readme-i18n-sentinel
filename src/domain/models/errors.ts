/**
 * Custom error types for readme-i18n-sentinel
 */

/**
 * Error thrown when user cancels an operation (e.g., during init)
 */
export class UserCancelledError extends Error {
  constructor(message = "Operation cancelled by user") {
    super(message);
    this.name = "UserCancelledError";
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly errors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * Error thrown when Git operations fail
 */
export class GitOperationError extends Error {
  constructor(
    message: string,
    public readonly command?: string,
  ) {
    super(message);
    this.name = "GitOperationError";
  }
}
