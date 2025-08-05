import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ConfigSchema } from "../../src/domain/models/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate current schema using native Zod v4 feature
const currentSchema = z.toJSONSchema(ConfigSchema, {
  target: "draft-7",
});
const currentSchemaWithMetadata = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "readme-i18n-sentinel Configuration",
  description: "Configuration schema for readme-i18n-sentinel",
  ...currentSchema,
};

// Read existing schema
const schemaPath = join(__dirname, "../../schema/config.schema.json");
let existingSchema: unknown;

try {
  existingSchema = JSON.parse(readFileSync(schemaPath, "utf-8"));
} catch {
  console.error("❌ Failed to read existing schema file");
  console.error("   Run 'bun run generate:schema' first");
  process.exit(1);
}

// Compare schemas
const currentStr = JSON.stringify(currentSchemaWithMetadata, null, 2);
const existingStr = JSON.stringify(existingSchema, null, 2);

if (currentStr !== existingStr) {
  console.error("❌ Schema is out of date!");
  console.error("   Run 'bun run generate:schema' to update");
  process.exit(1);
}

console.log("✅ Schema is up to date");
