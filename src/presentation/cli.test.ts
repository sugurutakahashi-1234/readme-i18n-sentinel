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
      execSync(`bun ${cliPath} --json`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      const parsed = JSON.parse(error.stdout.toString());

      // Check summary fields
      expect(parsed.summary.checkedFiles).toEqual(["README.ja.md"]);
      expect(parsed.summary.passedFiles).toEqual([]);
      expect(parsed.summary.failedFiles).toEqual(["README.ja.md"]);

      // Check error details
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.errors[0].type).toBe("line-count");
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

  test("auto-detection is equivalent to explicit pattern", async () => {
    // Create test directory structure
    const content = "# Test\n\nContent\n";
    const translatedContent = "# テスト\n\nコンテンツ\n";

    // Root files
    await writeFile("README.md", content);
    await writeFile("README.ja.md", translatedContent);

    // docs flat structure
    await mkdir("docs", { recursive: true });
    await writeFile("docs/README.es.md", translatedContent);

    // Language directories
    await mkdir("docs/fr", { recursive: true });
    await writeFile("docs/fr/README.md", translatedContent);

    // Run with auto-detection
    let autoExitCode = 0;
    let autoOutput = "";
    try {
      autoOutput = execSync(`bun ${cliPath} --json`, {
        stdio: "pipe",
        encoding: "utf-8",
      }).toString();
    } catch (error: any) {
      autoExitCode = error.status;
      autoOutput = error.stdout?.toString() || "";
    }

    // Run with explicit pattern
    let explicitExitCode = 0;
    let explicitOutput = "";
    try {
      explicitOutput = execSync(
        `bun ${cliPath} --source "README.md" --target "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}" --json`,
        {
          stdio: "pipe",
          encoding: "utf-8",
        },
      ).toString();
    } catch (error: any) {
      explicitExitCode = error.status;
      explicitOutput = error.stdout?.toString() || "";
    }

    // Both should have same exit code
    expect(autoExitCode).toBe(explicitExitCode);

    // Parse JSON outputs
    const autoResult = JSON.parse(autoOutput);
    const explicitResult = JSON.parse(explicitOutput);

    // Check that same configuration is used
    expect(autoResult.config.source).toBe(explicitResult.config.source);
    expect(autoResult.config.source).toBe("README.md");

    // Check that both use the same target pattern
    expect(autoResult.config.target).toBe(explicitResult.config.target);

    // The target should be the expected glob pattern
    const expectedPattern =
      "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}";
    expect(autoResult.config.target).toBe(expectedPattern);

    // Check that summary is always present and same
    expect(autoResult.summary.failedFiles.sort()).toEqual(
      explicitResult.summary.failedFiles.sort(),
    );
  });

  test("detects files in docs directory patterns", async () => {
    // Create various docs patterns
    const content = "# Test\n";
    await writeFile("README.md", content);

    // Pattern 1: docs/README.*.md
    await mkdir("docs", { recursive: true });
    await writeFile("docs/README.ja.md", content);
    await writeFile("docs/README.zh-CN.md", content);

    // Pattern 2: docs/*/README.md
    await mkdir("docs/en", { recursive: true });
    await mkdir("docs/ja", { recursive: true });
    await writeFile("docs/en/README.md", content);
    await writeFile("docs/ja/README.md", content);

    // Pattern 3: docs/*/README.*.md
    await mkdir("docs/i18n", { recursive: true });
    await writeFile("docs/i18n/README.es.md", content);

    const result = execSync(`bun ${cliPath} --json`, {
      stdio: "pipe",
      encoding: "utf-8",
    }).toString();

    const parsed = JSON.parse(result);

    // Check that the default target pattern is used
    const targetConfig = parsed.config.target;
    const expectedPattern =
      "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}";
    expect(targetConfig).toBe(expectedPattern);

    // Verify all expected files were checked
    expect(parsed.summary.checkedFiles.sort()).toEqual([
      "docs/README.ja.md",
      "docs/README.zh-CN.md",
      "docs/en/README.md",
      "docs/i18n/README.es.md",
      "docs/ja/README.md",
    ]);

    // All files should pass
    expect(parsed.summary.passedFiles.sort()).toEqual([
      "docs/README.ja.md",
      "docs/README.zh-CN.md",
      "docs/en/README.md",
      "docs/i18n/README.es.md",
      "docs/ja/README.md",
    ]);

    // No failures
    expect(parsed.summary.failedFiles).toEqual([]);
    expect(parsed.isValid).toBe(true);
  });
});
