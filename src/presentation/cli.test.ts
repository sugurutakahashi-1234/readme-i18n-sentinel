import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;
let originalCwd: string;

describe("CLI Tests", () => {
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
    expect(result).toContain("--require-original-section-titles");
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

describe("CLI E2E Tests", () => {
  const cliPath = join(__dirname, "cli.ts");

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = join(
      tmpdir(),
      `cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("detects outdated translations", async () => {
    // Create files with different content
    await writeFile("README.md", "# Title\n\nLine 1\nLine 2\n");
    await writeFile("README.ja.md", "# Title\n\nLine 1\n");

    try {
      execSync(`bun ${cliPath}`, { stdio: "pipe" });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain("issue");
      expect(error.stdout.toString()).toContain("Line count mismatch");
    }
  });

  test("passes when translations are up to date", async () => {
    // Create files with same content
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);

    const result = execSync(`bun ${cliPath}`, {
      stdio: "pipe",
      encoding: "utf-8",
    }).toString();

    expect(result).toContain("✅ All translations are up to date");
  });
});
