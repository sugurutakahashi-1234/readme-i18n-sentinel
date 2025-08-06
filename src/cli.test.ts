import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;
let originalCwd: string;

describe("CLI E2E Tests", () => {
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

  test("check command detects outdated translations", async () => {
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
      expect(error.stdout.toString()).toContain("issue");
      expect(error.stdout.toString()).toContain("Line count mismatch");
    }
  });

  test("check command passes when translations are up to date", async () => {
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

    // stdout output is expected for human-readable output
    expect(result).toContain("✅ All translations are up to date");
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
