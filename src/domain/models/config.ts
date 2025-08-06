import { z } from "zod";

/**
 * Check configurations schema
 */
const ChecksConfigSchema = z
  .object({
    checkLineCount: z.boolean().default(true),
    checkChangedLines: z.boolean().default(true),
    strictHeadings: z.boolean().default(false),
  })
  .default({
    checkLineCount: true,
    checkChangedLines: true,
    strictHeadings: false,
  });

/**
 * Output configuration schema
 */
const OutputConfigSchema = z
  .object({
    json: z.boolean().default(false),
  })
  .default({
    json: false,
  });

/**
 * Configuration schema for readme-i18n-sentinel
 *
 * Defines the structure and validation rules for configuration files
 */
export const ConfigSchema = z.object({
  // Path to source README file
  source: z.string().min(1, "Source file path cannot be empty"),

  // Target file pattern (supports glob)
  target: z.string().min(1, "Target file pattern cannot be empty"),

  // Check configurations (all default to true)
  checks: ChecksConfigSchema,

  // Output configuration
  output: OutputConfigSchema,
});

// Type export
export type Config = z.infer<typeof ConfigSchema>;
