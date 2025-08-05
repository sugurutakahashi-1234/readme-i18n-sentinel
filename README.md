# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

A lightweight CLI tool to detect outdated translations in README files using Git diff. Keep your multi-language documentation in sync by catching translation drift early in your development workflow.

## What it does

Detects when your translated README files are out of sync with the source file by checking:
- Line count differences
- Which specific lines were changed but not translated
- Heading consistency across languages

**Example scenario:**

You update your English README:
```diff
- ## Installation
+ ## Installation

- Install using npm:
+ Install using npm or yarn:
```

But forget to update the Japanese version. Running `readme-i18n-sentinel` will catch this:
```
❌ README.ja.md: Line 3 not updated
```

## Installation

**Requirements:** Node.js v20 or higher

```bash
# Global installation (recommended)
npm install -g readme-i18n-sentinel

# Project-specific installation
npm install --save-dev readme-i18n-sentinel

# Or use directly with npx
npx readme-i18n-sentinel
```

## Quick Start

```bash
# Just run without any arguments - it will auto-detect README files
readme-i18n-sentinel

# The tool will automatically:
# 1. Find README.md as the source
# 2. Find all README.*.md files as translations
# 3. Check if translations are up to date

# Generate a configuration file if you need custom settings
readme-i18n-sentinel init
```

## Configuration

The tool searches for configuration in the following locations (powered by [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)):

- `package.json` (under "readme-i18n-sentinel" property)
- `.readme-i18n-sentinelrc` (no extension)
- `.readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `.config/readme-i18n-sentinelrc` (no extension)
- `.config/readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `readme-i18n-sentinel.config.{js,ts,mjs,cjs}`

### Example configurations

**TypeScript/JavaScript (recommended):**
```typescript
// readme-i18n-sentinel.config.ts
import { defineConfig } from 'readme-i18n-sentinel/config';

export default defineConfig({
  source: 'README.md',
  target: 'README.*.md',  // Glob pattern for all translations
  checks: {
    lines: true,         // Check line count matches
    changes: true,       // Check changed lines are updated
    headingsMatchSource: true  // Check headings match exactly
  },
  output: {
    json: false  // Set to true for JSON output
  }
});
```

**JSON:**
```json
{
  "source": "docs/README.md",
  "target": "docs/README.*.md"
}
```

**YAML:**
```yaml
source: README.md
target: README.*.md
checks:
  headingsMatchSource: true
```

## Usage

### Auto-detection (Recommended)

```bash
# Just run without any arguments
readme-i18n-sentinel

# The tool will automatically:
# - Look for README.md as the source
# - Find all README.*.md files as targets (e.g., README.ja.md, README.zh-CN.md)
```

### Command Line Options

```bash
# Disable specific checks
readme-i18n-sentinel --no-lines

# JSON output for CI integration
readme-i18n-sentinel --json

# Use specific config file
readme-i18n-sentinel -c myconfig.yml

# Specify custom paths
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"

# Mix config file with CLI overrides
readme-i18n-sentinel -c config.json --json --no-changes
```

Available options:
- `-c, --config <path>` - Path to configuration file
- `-s, --source <path>` - Source README file path
- `-t, --target <pattern>` - Target file pattern (glob supported, can be specified multiple times)
- `--no-lines` - Disable line count check
- `--no-changes` - Disable changes check
- `--no-headings-match-source` - Disable headings match check
- `--json` - Output in JSON format

**Priority:** CLI arguments > Config file > Auto-detection

### Common Use Cases

1. **Check translations before commit (with Husky)**
   ```bash
   # .husky/commit-msg
   
   # Check README translations if README.md is modified
   README_FILE='README.md'
   I18N_SKIP_FLAG='[i18n-skip]'  # You can customize this flag string
   
   if git diff --cached --name-only | grep -q "^${README_FILE}$"; then
     if ! grep -q "${I18N_SKIP_FLAG}" "$1"; then
       echo "📖 Checking README translations..."
       npx readme-i18n-sentinel || exit 1
     else
       echo "📖 Skipping README translation check due to ${I18N_SKIP_FLAG} flag"
     fi
   fi
   ```

2. **CI/CD Pipeline**
   ```yaml
   # GitHub Actions example
   - name: Check README translations
     run: npx readme-i18n-sentinel
   ```

3. **Skip check temporarily**
   ```bash
   # Add [i18n-skip] to your commit message
   git commit -m "feat: update deps [i18n-skip]"
   ```
   
   This is useful when:
   - Making urgent hotfixes where translations can be updated later
   - Updating non-content changes (formatting, code examples)
   - Working on documentation incrementally
   
   **Note:** Remember to update translations in a follow-up commit!

## Commands

### `readme-i18n-sentinel` (default)

Check translation files for outdated content.

```bash
readme-i18n-sentinel [options]
```

Options:
- `-c, --config <path>` - Path to configuration file
- `-v, --version` - Display version
- `--help` - Show help

### `readme-i18n-sentinel init`

Create a configuration file interactively.

```bash
readme-i18n-sentinel init [options]
```

Options:
- `-y, --yes` - Skip prompts and use defaults

### `readme-i18n-sentinel validate`

Validate your configuration file.

```bash
readme-i18n-sentinel validate [config-file]
```

## Check Types

### Line Count Check (`lines`)
Ensures source and translation files have the same number of lines. Catches missing or extra content.

### Change Detection (`changes`)
Uses `git diff` to detect which lines changed in the source file and verifies those same lines were updated in translations.

### Heading Consistency (`headingsMatchSource`)
Ensures all markdown headings (`#`, `##`, etc.) match exactly between source and translations. This is crucial for:
- Maintaining document structure
- Keeping anchor links working
- Ensuring consistent navigation

**Important:** Headings should remain in the source language (typically English) across all translations to maintain URL anchors.

## Output Formats

### Text Format (default)
Human-readable output for terminal:
```
❌ README.ja.md: Line 42 not updated
❌ README.zh-CN.md: Line count mismatch (120 ≠ 118)
❌ README.ja.md: Heading mismatch => "## Getting Started"
```

### JSON Format
Machine-readable output for automation:
```json
{
  "isValid": false,
  "errors": [
    {
      "file": "README.ja.md",
      "type": "line-missing",
      "line": 42,
      "details": "Line 42 was changed in source but not in target"
    },
    {
      "file": "README.zh-CN.md",
      "type": "lines-mismatch",
      "details": "Line count mismatch: source has 118 lines, target has 120 lines"
    }
  ]
}
```

## Tips

- **Start small**: Begin with just line count checks, then enable other checks gradually
- **Use with Git hooks**: Integrate with Husky to catch issues before commit
- **CI Integration**: Add to your CI pipeline to ensure PRs don't break translations
- **Heading rule**: Keep headings in English across all language versions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## See Also

- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - Configuration file loader
- [simple-git](https://github.com/steveukx/git-js) - Git integration
- [Husky](https://typicode.github.io/husky/) - Git hooks made easy
