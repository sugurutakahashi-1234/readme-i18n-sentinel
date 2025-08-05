import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ConfigSchema } from "../../src/domain/models/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate JSON Schema from Zod schema using native Zod v4 feature
const jsonSchema = z.toJSONSchema(ConfigSchema, {
  target: "draft-7",
});

// Add additional metadata
const schemaWithMetadata = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "readme-i18n-sentinel Configuration",
  description: "Configuration schema for readme-i18n-sentinel",
  ...jsonSchema,
};

// Write to schema directory
const outputPath = join(__dirname, "../../schema/config.schema.json");
writeFileSync(outputPath, JSON.stringify(schemaWithMetadata, null, 2));

console.log(`✅ Generated schema at: ${outputPath}`);
