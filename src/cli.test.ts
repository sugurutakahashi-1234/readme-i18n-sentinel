import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;
let originalCwd: string;

describe("CLI Basic Tests", () => {
  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = join(
      tmpdir(),
      `cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(testDir, { recursive: true });
    process.chdir(testDir);

    // Initialize git repository
    execSync("git init -q");
    execSync('git config user.email "test@example.com"');
    execSync('git config user.name "Test User"');
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("init command creates config file", () => {
    execSync(`bun ${join(originalCwd, "src/presentation/cli.ts")} init --yes`, {
      stdio: "pipe",
    });

    expect(existsSync("readme-i18n-sentinel.config.ts")).toBe(true);
  });

  test("validate command validates config", async () => {
    const config = {
      source: "README.md",
      target: "README.ja.md",
    };
    await writeFile(
      "readme-i18n-sentinel.config.js",
      `module.exports = ${JSON.stringify(config, null, 2)};`,
    );

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} validate`,
      { stdio: "pipe" },
    ).toString();

    expect(result).toContain("✅");
    expect(result).toContain("Configuration is valid");
  });

  test("check command detects outdated translations", async () => {
    // Create config
    const config = {
      source: "README.md",
      target: "README.ja.md",
    };
    await writeFile(
      "readme-i18n-sentinel.config.js",
      `module.exports = ${JSON.stringify(config, null, 2)};`,
    );

    // Create files with different content
    await writeFile("README.md", "# Title\n\nLine 1\nLine 2\n");
    await writeFile("README.ja.md", "# Title\n\nLine 1\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    try {
      execSync(`bun ${join(originalCwd, "src/presentation/cli.ts")}`, {
        stdio: "pipe",
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stderr.toString()).toContain("❌");
      expect(error.stderr.toString()).toContain("Line count mismatch");
    }
  });

  test("check command passes when translations are up to date", async () => {
    // Create config
    const config = {
      source: "README.md",
      target: "README.ja.md",
    };
    await writeFile(
      "readme-i18n-sentinel.config.js",
      `module.exports = ${JSON.stringify(config, null, 2)};`,
    );

    // Create files with same content
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")}`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // stderr output is expected for human-readable output
    expect(result).toBe("");
  });

  test("shows version", () => {
    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --version`,
      { stdio: "pipe" },
    )
      .toString()
      .trim();

    expect(result).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
