import type { ZodError } from "zod";

/**
 * Format Zod validation errors into a standardized format
 */
export function formatZodErrors(
  error: ZodError<unknown>,
): Array<{ path: string; message: string }> {
  // In Zod v4, the errors array is accessed through 'issues' property
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}
