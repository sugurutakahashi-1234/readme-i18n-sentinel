import { writeFileSync } from "node:fs";
import * as p from "@clack/prompts";
import yaml from "yaml";
import type { Config } from "../../domain/models/config.js";
import { UserCancelledError } from "../../domain/models/errors.js";

type ConfigFormat = "typescript" | "javascript" | "json" | "yaml";

export async function promptForConfigFormat(): Promise<ConfigFormat> {
  const format = await p.select({
    message: "Select configuration file format:",
    options: [
      {
        value: "typescript",
        label: "TypeScript",
        hint: "readme-i18n-sentinel.config.ts",
      },
      {
        value: "javascript",
        label: "JavaScript",
        hint: "readme-i18n-sentinel.config.js",
      },
      {
        value: "json",
        label: "JSON",
        hint: "readme-i18n-sentinel.config.json",
      },
      { value: "yaml", label: "YAML", hint: "readme-i18n-sentinel.config.yml" },
    ],
  });

  if (p.isCancel(format)) {
    throw new UserCancelledError();
  }

  return format as ConfigFormat;
}

export async function generateConfigFile(
  config: Config,
  format: ConfigFormat,
): Promise<string> {
  let filename: string;
  let content: string;

  switch (format) {
    case "typescript":
      filename = "readme-i18n-sentinel.config.ts";
      content = generateTypeScriptConfig(config);
      break;
    case "javascript":
      filename = "readme-i18n-sentinel.config.js";
      content = generateJavaScriptConfig(config);
      break;
    case "json":
      filename = "readme-i18n-sentinel.config.json";
      content = generateJsonConfig(config);
      break;
    case "yaml":
      filename = "readme-i18n-sentinel.config.yml";
      content = generateYamlConfig(config);
      break;
  }

  writeFileSync(filename, content, "utf-8");
  return filename;
}

function generateTypeScriptConfig(config: Config): string {
  return `import { defineConfig } from 'readme-i18n-sentinel/config';

export default defineConfig({
  source: '${config.source}',
  target: '${config.target}',
  checks: {
    lines: ${config.checks?.lines},
    changes: ${config.checks?.changes},
    headingsMatchSource: ${config.checks?.headingsMatchSource}
  },
  output: {
    json: ${config.output?.json}
  }
});
`;
}

function generateJavaScriptConfig(config: Config): string {
  return `/** @type {import('readme-i18n-sentinel/config').Config} */
export default {
  source: '${config.source}',
  target: '${config.target}',
  checks: {
    lines: ${config.checks?.lines},
    changes: ${config.checks?.changes},
    headingsMatchSource: ${config.checks?.headingsMatchSource}
  },
  output: {
    json: ${config.output?.json}
  }
};
`;
}

function generateJsonConfig(config: Config): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

function generateYamlConfig(config: Config): string {
  return yaml.stringify(config);
}
