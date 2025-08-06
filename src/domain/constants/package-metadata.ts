import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json dynamically
const packageJsonPath = join(__dirname, "../../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

export function getPackageName(): string {
  return packageJson.name;
}

export function getVersion(): string {
  return packageJson.version;
}

export function getDescription(): string {
  return packageJson.description;
}
