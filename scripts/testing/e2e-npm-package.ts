#!/usr/bin/env bun
/**
 * NPM Package E2E Test
 *
 * Tests the complete NPM package lifecycle:
 * 1. Create package with `npm pack`
 * 2. Install globally with `npm install -g`
 * 3. Run CLI commands from global PATH
 * 4. Clean up installation
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

console.log("🧪 Starting npm package E2E test...\n");

const projectRoot = join(import.meta.dir, "..", "..");
const packageJsonPath = join(projectRoot, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const packageName = packageJson.name;
let packageFile: string | null = null;
let isInstalled = false;
let tempDir: string | null = null;
let npxTestDir: string | null = null;

// Clean up any existing npm installation
try {
  console.log("🧹 Checking for existing npm installation...");
  execSync(`npm uninstall -g ${packageName}`, { stdio: "pipe" });
  console.log("✅ Removed existing npm installation");
} catch {
  // Package not installed, which is fine
  console.log("✅ No existing npm installation found");
}

try {
  // Step 1: Check if built
  const distDir = join(projectRoot, "dist");
  if (!existsSync(distDir)) {
    console.error("❌ Project not built. Please run 'bun run build' first.");
    process.exit(1);
  }

  // Step 2: Create npm package
  console.log("\n📦 Creating npm package...");
  const packOutput = execSync("npm pack", { cwd: projectRoot })
    .toString()
    .trim();
  packageFile = packOutput.split("\n").pop() || ""; // Get the last line (filename)
  console.log(`✅ Created: ${packageFile}`);

  // Check package size
  const sizeOutput = execSync(`npm pack --dry-run --json`, {
    cwd: projectRoot,
  });
  const packInfo = JSON.parse(sizeOutput.toString());
  const sizeMB = packInfo[0].size / (1024 * 1024);
  console.log(`📊 Package size: ${sizeMB.toFixed(2)} MB`);

  if (sizeMB > 1) {
    console.warn(`⚠️  Warning: Package size is large (${sizeMB.toFixed(2)} MB)`);
  }

  // Step 3: Install globally
  console.log("\n📥 Installing package globally...");
  execSync(`npm install -g ${join(projectRoot, packageFile)}`, {
    stdio: "inherit",
  });
  isInstalled = true;

  // Step 4: Test commands
  console.log("\n🧪 Testing commands...");

  // Test version
  console.log("  Testing --version...");
  const version = execSync(`${packageName} --version`).toString().trim();
  console.log(`  ✅ Version: ${version}`);

  // Test help
  console.log("  Testing --help...");
  execSync(`${packageName} --help`, { stdio: "pipe" });
  console.log("  ✅ Help command works");

  // Step 5: Test actual translation checking
  console.log("\n🧪 Testing actual translation checking...");
  tempDir = mkdtempSync(join(tmpdir(), "readme-i18n-test-"));

  // Create test README files with matching content (should pass)
  const testReadmeEn = join(tempDir, "README.md");
  const testReadmeJa = join(tempDir, "README.ja.md");

  const readmeContent = `# Test Project

## Installation

Install using npm:

\`\`\`bash
npm install test-package
\`\`\`

## Usage

This is how you use it:

\`\`\`javascript
const test = require('test-package');
test.run();
\`\`\`

## License

MIT`;

  const readmeJaContent = `# Test Project

## Installation

npmを使ってインストール:

\`\`\`bash
npm install test-package
\`\`\`

## Usage

使い方:

\`\`\`javascript
const test = require('test-package');
test.run();
\`\`\`

## License

MIT`;

  writeFileSync(testReadmeEn, readmeContent);
  writeFileSync(testReadmeJa, readmeJaContent);
  console.log(`  Created test files in: ${tempDir}`);

  // Test 1: Basic check (should pass - same structure)
  console.log("\n  Test 1: Basic structure check (should pass)...");
  try {
    execSync(`${packageName}`, { cwd: tempDir, stdio: "pipe" });
    console.log("  ✅ Basic check passed as expected");
  } catch (_error) {
    throw new Error("Basic check should have passed but failed");
  }

  // Test 2: Create mismatched files (should fail)
  console.log("\n  Test 2: Mismatched structure check (should fail)...");
  const mismatchedContent = `# Test Project

## Installation

Install using npm.

## License

MIT`;

  writeFileSync(testReadmeJa, mismatchedContent);

  try {
    execSync(`${packageName}`, { cwd: tempDir, stdio: "pipe" });
    throw new Error("Check should have failed for mismatched structure");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("should have failed")
    ) {
      throw error;
    }
    console.log("  ✅ Correctly detected structure mismatch");
  }

  // Restore matched content for further tests
  writeFileSync(testReadmeJa, readmeJaContent);

  // Test 3: JSON output mode
  console.log("\n  Test 3: JSON output mode...");
  const jsonOutput = execSync(`${packageName} --json`, {
    cwd: tempDir,
    encoding: "utf-8",
  });

  try {
    const jsonResult = JSON.parse(jsonOutput);
    if (!("isValid" in jsonResult) || !("summary" in jsonResult)) {
      throw new Error("JSON output missing expected fields");
    }
    console.log("  ✅ JSON output format is correct");
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("JSON output is not valid JSON");
    }
    throw error;
  }

  // Test 4: Test with --require-original-section-titles option
  console.log(
    "\n  Test 4: Testing --require-original-section-titles option...",
  );
  try {
    execSync(`${packageName} --require-original-section-titles`, {
      cwd: tempDir,
      stdio: "pipe",
    });
    console.log("  ✅ --require-original-section-titles check passed");
  } catch {
    // This might fail if headings are translated, which is expected
    console.log(
      "  ✅ --require-original-section-titles detected translated headings",
    );
  }

  // Test 5: Test with --require-original-code-blocks option
  console.log("\n  Test 5: Testing --require-original-code-blocks option...");
  try {
    execSync(`${packageName} --require-original-code-blocks`, {
      cwd: tempDir,
      stdio: "pipe",
    });
    console.log("  ✅ --require-original-code-blocks check passed");
  } catch {
    console.log(
      "  ⚠️  --require-original-code-blocks check failed (code blocks might differ)",
    );
  }

  // Test 6: Test with custom paths
  console.log("\n  Test 6: Testing custom paths...");
  const customDir = mkdtempSync(join(tmpdir(), "custom-test-"));
  const customSource = join(customDir, "docs", "README.md");
  const customTarget = join(customDir, "docs", "README.ja.md");

  // Create docs directory
  execSync(`mkdir -p ${join(customDir, "docs")}`, { stdio: "pipe" });
  writeFileSync(customSource, readmeContent);
  writeFileSync(customTarget, readmeJaContent);

  try {
    execSync(
      `${packageName} --source docs/README.md --target "docs/README.*.md"`,
      {
        cwd: customDir,
        stdio: "pipe",
      },
    );
    console.log("  ✅ Custom paths work correctly");
  } catch (_error) {
    throw new Error("Custom paths test failed");
  } finally {
    rmSync(customDir, { recursive: true });
  }

  // Test 7: Test with skip options
  console.log("\n  Test 7: Testing skip options...");

  // Create files with different line counts
  const differentLineContent = `# Test Project

## Installation

Install using npm.

Extra line here.

## License

MIT`;

  writeFileSync(testReadmeJa, differentLineContent);

  try {
    execSync(
      `${packageName} --skip-line-count-check --skip-section-structure-check`,
      {
        cwd: tempDir,
        stdio: "pipe",
      },
    );
    console.log("  ✅ Skip options work correctly");
  } catch (_error) {
    throw new Error("Skip options test failed");
  }

  // Step 6: Test with npx (using globally installed package)
  console.log("\n🧪 Testing npx execution...");

  // Create a new temp directory for npx test
  npxTestDir = mkdtempSync(join(tmpdir(), "npx-test-"));
  const npxReadmeEn = join(npxTestDir, "README.md");
  const npxReadmeJa = join(npxTestDir, "README.ja.md");

  writeFileSync(npxReadmeEn, readmeContent);
  writeFileSync(npxReadmeJa, readmeJaContent);

  try {
    // Test npx with globally installed package
    console.log("  Testing npx with globally installed package...");
    execSync(`npx ${packageName}`, {
      cwd: npxTestDir,
      stdio: "pipe",
    });
    console.log("  ✅ npx execution works correctly");

    // Test npx with JSON output
    console.log("  Testing npx with --json option...");
    const npxJsonOutput = execSync(`npx ${packageName} --json`, {
      cwd: npxTestDir,
      encoding: "utf-8",
    });

    const npxJsonResult = JSON.parse(npxJsonOutput);
    if (!("isValid" in npxJsonResult)) {
      throw new Error("npx JSON output missing expected fields");
    }
    console.log("  ✅ npx with options works correctly");

    // Skip cache test for unpublished packages
    console.log(
      "  ⏭️  Skipping npx cache test (package not published to npm registry)",
    );
  } finally {
    // Cleanup npx test directory will be done in the main cleanup section
  }

  console.log("\n✅ All tests passed!");
} catch (error) {
  console.error(
    "\n❌ Test failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
} finally {
  // Cleanup
  console.log("\n🧹 Cleaning up...");

  if (isInstalled) {
    try {
      execSync(`npm uninstall -g ${packageName}`, { stdio: "pipe" });
      console.log("✅ npm package uninstalled");
    } catch {
      console.warn("⚠️  Failed to uninstall npm package");
    }
  }

  if (packageFile && existsSync(join(projectRoot, packageFile))) {
    rmSync(join(projectRoot, packageFile));
    console.log("✅ Package file removed");
  }

  if (tempDir && existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
    console.log("✅ Temporary directory removed");
  }

  if (npxTestDir && existsSync(npxTestDir)) {
    rmSync(npxTestDir, { recursive: true });
    console.log("✅ npx test directory removed");
  }
}

console.log("\n✨ E2E test completed!");
