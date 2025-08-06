import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GitAdapter } from "./git.adapter.js";

let testDir: string;
let originalCwd: string;

describe("GitAdapter", () => {
  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = join(
      tmpdir(),
      `git-adapter-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  test("detects git repository", async () => {
    const git = new GitAdapter();
    const isRepo = await git.isGitRepository();
    expect(isRepo).toBe(true);
  });

  test("getChangedLines detects added lines", async () => {
    // Create and commit initial file
    await writeFile("test.txt", "Line 1\nLine 2\nLine 3\n");
    execSync("git add test.txt");
    execSync('git commit -m "Initial commit"');

    // Modify file
    await writeFile("test.txt", "Line 1\nLine 2 modified\nLine 3\nLine 4\n");

    const git = new GitAdapter();
    const changedLines = await git.getChangedLines("test.txt");

    // Lines 2 and 4 should be marked as changed
    expect(changedLines).toContain(2);
    expect(changedLines).toContain(4);
  });

  test("getChangedLines with staged changes", async () => {
    // Create and commit initial file
    await writeFile("test.txt", "Line 1\nLine 2\nLine 3\n");
    execSync("git add test.txt");
    execSync('git commit -m "Initial commit"');

    // Modify and stage file
    await writeFile("test.txt", "Line 1\nLine 2 modified\nLine 3\n");
    execSync("git add test.txt");

    const git = new GitAdapter();
    const changedLines = await git.getChangedLines("test.txt");

    // Line 2 should be marked as changed
    expect(changedLines).toContain(2);
  });

  test("getChangedLines returns empty for unchanged file", async () => {
    // Create and commit file
    await writeFile("test.txt", "Content\n");
    execSync("git add test.txt");
    execSync('git commit -m "Initial commit"');

    const git = new GitAdapter();
    const changedLines = await git.getChangedLines("test.txt");

    expect(changedLines).toEqual([]);
  });
});
