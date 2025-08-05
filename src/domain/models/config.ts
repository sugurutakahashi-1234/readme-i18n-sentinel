import { z } from "zod";

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
  checks: z
    .object({
      lines: z.boolean().default(true),
      changes: z.boolean().default(true),
      headingsMatchSource: z.boolean().default(true),
    })
    .default({
      lines: true,
      changes: true,
      headingsMatchSource: true,
    }),

  // Output configuration
  output: z
    .object({
      json: z.boolean().default(false),
    })
    .default({
      json: false,
    }),
});

// Type export
export type Config = z.infer<typeof ConfigSchema>;
