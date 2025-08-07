import { z } from "zod";

/**
 * Check configurations schema
 */
const ChecksConfigSchema = z
  .object({
    skip: z
      .object({
        sectionStructure: z.boolean().default(false),
        sectionPosition: z.boolean().default(false),
        lineCount: z.boolean().default(false),
      })
      .default({
        sectionStructure: false,
        sectionPosition: false,
        lineCount: false,
      }),
    require: z
      .object({
        originalSectionTitles: z.boolean().default(false),
        originalCodeBlocks: z.boolean().default(false),
      })
      .default({
        originalSectionTitles: false,
        originalCodeBlocks: false,
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
