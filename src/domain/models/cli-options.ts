import { z } from "zod";

/**
 * Raw CLI options schema
 * Represents exactly what the user typed on the command line
 * All fields are optional because the user may not provide them
 */
export const RawCLIOptionsSchema = z.object({
  // Existing option
  config: z.string().optional(),

  // New options
  source: z.string().optional(),
  target: z.string().optional(),
  lines: z.boolean().optional(),
  changes: z.boolean().optional(),
  headingsMatchSource: z.boolean().optional(),
  json: z.boolean().optional(),
});

export type RawCLIOptions = z.infer<typeof RawCLIOptionsSchema>;
