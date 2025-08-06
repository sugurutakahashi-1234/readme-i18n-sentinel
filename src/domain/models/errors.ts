/**
 * Custom error types for readme-i18n-sentinel
 */

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
