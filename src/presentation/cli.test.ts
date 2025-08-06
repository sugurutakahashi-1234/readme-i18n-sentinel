import { describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("CLI Presentation Layer Tests", () => {
  const cliPath = join(__dirname, "cli.ts");

  test("shows version with --version flag", () => {
    const result = execSync(`bun ${cliPath} --version`, {
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();

    expect(result).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("shows version with -v flag", () => {
    const result = execSync(`bun ${cliPath} -v`, {
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();

    expect(result).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("shows help with --help flag", () => {
    const result = execSync(`bun ${cliPath} --help`, {
      stdio: "pipe",
      encoding: "utf-8",
    });

    expect(result).toContain("Usage:");
    expect(result).toContain("Options:");
    expect(result).toContain("Examples:");
    expect(result).toContain("--source");
    expect(result).toContain("--target");
    expect(result).toContain("--strict-headings");
    expect(result).toContain("--json");
  });

  test("shows help with -h flag", () => {
    const result = execSync(`bun ${cliPath} -h`, {
      stdio: "pipe",
      encoding: "utf-8",
    });

    expect(result).toContain("Usage:");
    expect(result).toContain("Options:");
  });
});
