import { z } from "zod";

/**
 * Raw CLI options schema
 * Represents exactly what the user typed on the command line
 * All fields are optional because the user may not provide them
 */
const RawCLIOptionsSchema = z.object({
  source: z.string().optional(),
  target: z.string().optional(),
  sectionStructure: z.boolean().optional(),
  sectionPosition: z.boolean().optional(),
  sectionTitle: z.boolean().optional(),
  lineCount: z.boolean().optional(),
  codeBlock: z.boolean().optional(),
  json: z.boolean().optional(),
});

export type RawCLIOptions = z.infer<typeof RawCLIOptionsSchema>;
