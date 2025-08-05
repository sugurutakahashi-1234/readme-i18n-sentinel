import * as p from "@clack/prompts";
import type { Config } from "../../domain/models/config.js";
import {
  generateConfigFile,
  promptForConfigFormat,
} from "../../infrastructure/services/config-file-generator.js";
import { promptForConfig } from "../../infrastructure/services/interactive-prompts.js";

export async function initConfigUseCase(skipPrompts: boolean): Promise<void> {
  let config: Config;
  let format: "typescript" | "javascript" | "json" | "yaml";

  if (skipPrompts) {
    // Use default configuration
    config = {
      source: "README.md",
      target: "README.*.md",
      checks: {
        lines: true,
        changes: true,
        headingsMatchSource: true,
      },
      output: {
        json: false,
      },
    };
    format = "typescript";
  } else {
    // Interactive prompts
    config = await promptForConfig();
    format = await promptForConfigFormat();
  }

  // Generate configuration file
  const filename = await generateConfigFile(config, format);

  p.note(
    `Configuration file created: ${filename}
    
You can now run:
  readme-i18n-sentinel

To check your translations!`,
    "✅ Success",
  );
}
