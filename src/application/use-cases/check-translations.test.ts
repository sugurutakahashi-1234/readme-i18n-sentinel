import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Config } from "../../domain/models/config.js";
import { checkTranslationsUseCase } from "./check-translations.js";

let testDir: string;
let originalCwd: string;

describe("checkTranslationsUseCase Integration Tests", () => {
  beforeEach(async () => {
    // Save original working directory
    originalCwd = process.cwd();

    // Create unique temp directory for each test
    testDir = join(
      tmpdir(),
      `check-translations-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(testDir, { recursive: true });

    // Initialize git repository
    execSync("git init", { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Change back to original directory
    process.chdir(originalCwd);

    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("detects all types of issues", async () => {
    // Create source file
    await writeFile(
      "README.md",
      "# Installation\n\nStep 1\nStep 2\nStep 3\n## Usage\n\nHow to use\n",
    );

    // Create target file with same line count but issues
    await writeFile(
      "README.ja.md",
      "# インストール\n\nStep 1\nStep 2\n\n## Usage\n\nHow to use\n", // Same line count, wrong heading, missing Step 3
    );

    // Commit initial state
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    // Make changes to source
    await writeFile(
      "README.md",
      "# Installation\n\nStep 1 updated\nStep 2\nStep 3\n## Usage\n\nHow to use\n",
    );
    execSync("git add README.md");

    const config: Config = {
      source: "README.md",
      target: "README.ja.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    // Should detect missing change
    const changeError = result.errors.find((e) => e.type === "outdated-line");
    expect(changeError).toBeDefined();
    if (changeError?.type === "outdated-line") {
      expect(changeError.line).toBe(3);
    }

    // Should detect heading mismatch
    const headingError = result.errors.find(
      (e) => e.type === "heading-mismatch",
    );
    expect(headingError).toBeDefined();
    if (headingError?.type === "heading-mismatch") {
      expect(headingError.heading.expected.text).toBe("Installation");
    }
  });

  test("passes when all checks are satisfied", async () => {
    const content = "# Installation\n\nStep 1\n## Usage\n\nHow to use\n";

    // Create identical files
    await writeFile("README.md", content);
    await writeFile("README.ja.md", content);
    await writeFile("README.zh-CN.md", content);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const config: Config = {
      source: "README.md",
      target: "README.{ja,zh-CN}.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("handles missing source file", async () => {
    const config: Config = {
      source: "nonexistent.md",
      target: "README.ja.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    expect(checkTranslationsUseCase(config)).rejects.toThrow(
      "Source file not found",
    );
  });

  test("handles missing target file gracefully", async () => {
    await writeFile("README.md", "# Title\n");

    // Commit source file
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const config: Config = {
      source: "README.md",
      target: "nonexistent.ja.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.type).toBe("file-not-found");
    expect(result.errors[0]?.file).toBeDefined();
  });

  test("skips disabled checks", async () => {
    // Create files with different line counts and headings
    await writeFile("README.md", "# Title\n\nLine 1\nLine 2\n");
    await writeFile("README.ja.md", "# タイトル\n\nLine 1\n");

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const config: Config = {
      source: "README.md",
      target: "README.ja.md",
      checks: {
        checkLineCount: false, // Disabled
        checkChangedLines: false, // Disabled
        strictHeadings: false, // Disabled
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    // Should pass even though files differ
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("handles code blocks in heading extraction", async () => {
    const sourceContent = `# Real Heading

\`\`\`markdown
# This is not a heading
## Neither is this
\`\`\`

## Another Real Heading
`;

    const targetContent = `# Real Heading

\`\`\`markdown
# これは見出しではない
## これも違う
\`\`\`

## Another Real Heading
`;

    await writeFile("README.md", sourceContent);
    await writeFile("README.ja.md", targetContent);

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const config: Config = {
      source: "README.md",
      target: "README.ja.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    // Should pass - code blocks are ignored
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("handles multiple targets with different issues", async () => {
    // Create source
    await writeFile("README.md", "# Title\n\nContent\n");

    // Create targets with different issues
    await writeFile("README.ja.md", "# Title\n\n"); // Missing line
    await writeFile("README.zh-CN.md", "# 标题\n\nContent\n"); // Wrong heading

    // Commit files
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    const config: Config = {
      source: "README.md",
      target: "README.{ja,zh-CN}.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    expect(result.isValid).toBe(false);

    // Should have issues for both files
    const jaErrors = result.errors.filter((e) =>
      e.file.includes("README.ja.md"),
    );
    const zhErrors = result.errors.filter((e) =>
      e.file.includes("README.zh-CN.md"),
    );

    expect(jaErrors.length).toBeGreaterThan(0);
    expect(zhErrors.length).toBeGreaterThan(0);

    // ja.md should have line count issue
    expect(jaErrors.some((e) => e.type === "line-count-mismatch")).toBe(true);

    // zh-CN.md should have heading issue
    expect(zhErrors.some((e) => e.type === "heading-mismatch")).toBe(true);
  });

  test("detects changes when source is modified after commit", async () => {
    const initialContent = "# Title\n\nOriginal content\n";

    // Create files
    await writeFile("README.md", initialContent);
    await writeFile("README.ja.md", initialContent);

    // Commit initial state
    execSync("git add .");
    execSync('git commit -m "Initial commit"');

    // Modify source file
    await writeFile("README.md", "# Title\n\nModified content\n");
    execSync("git add README.md");

    const config: Config = {
      source: "README.md",
      target: "README.ja.md",
      checks: {
        checkLineCount: true,
        checkChangedLines: true,
        strictHeadings: true,
      },
      output: {
        json: false,
      },
    };

    const result = await checkTranslationsUseCase(config);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    const error = result.errors[0];
    expect(error?.type).toBe("outdated-line");
    if (error?.type === "outdated-line") {
      expect(error.line).toBe(3);
    }
  });
});
