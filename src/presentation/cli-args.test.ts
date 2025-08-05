import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;
let originalCwd: string;

describe("CLI Arguments Tests", () => {
  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = join(
      tmpdir(),
      `cli-args-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  test("check with auto-detection", async () => {
    // Create files with different content
    await writeFile("README.md", "# Title\n\nLine 1\nLine 2\n");
    await writeFile("README.ja.md", "# Title\n\nLine 1\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    try {
      // Run without any arguments - should auto-detect
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

  test("check with --source and --target options", async () => {
    // Create files with same content
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --source README.md --target README.ja.md`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should pass without errors
    expect(result).toBe("");
  });

  test("check with glob patterns", async () => {
    // Create files
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);
    await writeFile("README.zh.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --source README.md --target "README.*.md"`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should pass without errors
    expect(result).toBe("");
  });

  test("check with disabled checks", async () => {
    // Create files with different line counts
    await writeFile("README.md", "# Title\n\nLine 1\nLine 2\n");
    await writeFile("README.ja.md", "# Title\n\nLine 1\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --no-lines`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should pass without errors because line check is disabled
    expect(result).toBe("");
  });

  test("check with JSON output", async () => {
    // Create files
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --json`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should output JSON
    const json = JSON.parse(result);
    expect(json).toHaveProperty("isValid", true);
    expect(json).toHaveProperty("errors");
    expect(json.errors).toBeArrayOfSize(0);
  });

  test("config file takes precedence when no CLI args", async () => {
    // Create config
    const config = {
      source: "README.md",
      target: "README.ja.md",
    };
    await writeFile(
      "readme-i18n-sentinel.config.js",
      `module.exports = ${JSON.stringify(config, null, 2)};`,
    );

    // Create files
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

    // Should pass without errors
    expect(result).toBe("");
  });

  test("CLI args override config file", async () => {
    // Create config with different target
    const config = {
      source: "README.md",
      target: "README.es.md", // Spanish file
      output: {
        json: false,
      },
    };
    await writeFile(
      "readme-i18n-sentinel.config.js",
      `module.exports = ${JSON.stringify(config, null, 2)};`,
    );

    // Create files (no Spanish file)
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    // Override target with CLI args
    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")} --target README.ja.md --json`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should pass because we override to use ja.md instead of es.md
    const json = JSON.parse(result);
    expect(json.isValid).toBe(true);
  });

  test("auto-detection with no config or args", async () => {
    // Create standard README files
    const content = "# Title\n\nContent\n";
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);
    await writeFile("README.zh-CN.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const result = execSync(
      `bun ${join(originalCwd, "src/presentation/cli.ts")}`,
      { stdio: "pipe", encoding: "utf-8" },
    ).toString();

    // Should pass without errors
    expect(result).toBe("");
  });

  test("auto-detection fails when no README.md", async () => {
    // Create only translation files
    await writeFile("README.ja.md", "# Title\n\nContent\n");
    await writeFile("README.zh-CN.md", "# Title\n\nContent\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    try {
      execSync(`bun ${join(originalCwd, "src/presentation/cli.ts")}`, {
        stdio: "pipe",
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain("No README.md file found");
    }
  });

  test("auto-detection fails when no translation files", async () => {
    // Create only source file
    await writeFile("README.md", "# Title\n\nContent\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    try {
      execSync(`bun ${join(originalCwd, "src/presentation/cli.ts")}`, {
        stdio: "pipe",
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain(
        "No translation files (README.*.md) found",
      );
    }
  });
});
