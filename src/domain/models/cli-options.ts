import { z } from "zod";

/**
 * Raw CLI options schema
 * Represents exactly what the user typed on the command line
 * All fields are optional because the user may not provide them
 */
const RawCLIOptionsSchema = z.object({
  source: z.string().optional(),
  target: z.string().optional(),
  skipSectionStructureCheck: z.boolean().optional(),
  skipSectionPositionCheck: z.boolean().optional(),
  skipLineCountCheck: z.boolean().optional(),
  requireOriginalSectionTitles: z.boolean().optional(),
  requireOriginalCodeBlocks: z.boolean().optional(),
  json: z.boolean().optional(),
});

export type RawCLIOptions = z.infer<typeof RawCLIOptionsSchema>;
