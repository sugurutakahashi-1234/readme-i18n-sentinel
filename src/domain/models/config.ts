import { z } from "zod";

/**
 * Check configurations schema
 */
const ChecksConfigSchema = z
  .object({
    skip: z.object({
      sectionStructure: z.boolean(),
      sectionPosition: z.boolean(),
      lineCount: z.boolean(),
    }),
    require: z.object({
      originalSectionTitles: z.boolean(),
      originalCodeBlocks: z.boolean(),
    }),
  })
  .default({
    skip: {
      sectionStructure: false,
      sectionPosition: false,
      lineCount: false,
    },
    require: {
      originalSectionTitles: false,
      originalCodeBlocks: false,
    },
  });

/**
 * Output configuration schema
 */
const OutputConfigSchema = z
  .object({
    json: z.boolean(),
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
