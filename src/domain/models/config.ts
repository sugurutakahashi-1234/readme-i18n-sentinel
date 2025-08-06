import { z } from "zod";

/**
 * Check configurations schema
 */
const ChecksConfigSchema = z
  .object({
    sectionStructure: z.boolean().default(true),
    sectionPosition: z.boolean().default(true),
    sectionTitle: z.boolean().default(false),
    lineCount: z.boolean().default(true),
  })
  .default({
    sectionStructure: true,
    sectionPosition: true,
    sectionTitle: false,
    lineCount: true,
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
const ConfigSchema = z.object({
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
