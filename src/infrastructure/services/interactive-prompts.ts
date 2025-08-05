import * as p from "@clack/prompts";
import type { Config } from "../../domain/models/config.js";
import { UserCancelledError } from "../../domain/models/errors.js";

export async function promptForConfig(): Promise<Config> {
  p.intro("Welcome to readme-i18n-sentinel configuration wizard!");

  const source = await p.text({
    message: "Enter the path to your source README file:",
    placeholder: "docs/README.md",
    validate: (value) => {
      if (!value) return "Source file path is required";
      return undefined;
    },
  });

  if (p.isCancel(source)) {
    throw new UserCancelledError();
  }

  const target = await p.text({
    message: "Enter target file pattern (glob supported):",
    placeholder: "docs/README.*.md",
    validate: (value) => {
      if (!value) return "Target pattern is required";
      return undefined;
    },
  });

  if (p.isCancel(target)) {
    throw new UserCancelledError();
  }

  const enableChecks = await p.multiselect({
    message: "Which checks would you like to enable?",
    options: [
      {
        value: "lines",
        label: "Line count check",
        hint: "Ensure same number of lines",
      },
      {
        value: "changes",
        label: "Git changes check",
        hint: "Check if changed lines are updated",
      },
      {
        value: "headingsMatchSource",
        label: "Heading match check",
        hint: "Ensure headings match source",
      },
    ],
    initialValues: ["lines", "changes", "headingsMatchSource"],
  });

  if (p.isCancel(enableChecks)) {
    throw new UserCancelledError();
  }

  const outputJson = await p.confirm({
    message: "Output results as JSON?",
    initialValue: false,
  });

  if (p.isCancel(outputJson)) {
    throw new UserCancelledError();
  }

  const config: Config = {
    source,
    target,
    checks: {
      lines: enableChecks.includes("lines"),
      changes: enableChecks.includes("changes"),
      headingsMatchSource: enableChecks.includes("headingsMatchSource"),
    },
    output: {
      json: outputJson,
    },
  };

  p.outro("Configuration complete!");

  return config;
}
