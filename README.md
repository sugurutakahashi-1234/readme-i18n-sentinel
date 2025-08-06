# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

A lightweight CLI tool to detect outdated translations in README files. Keep your multi-language documentation in sync by catching translation drift early in your development workflow.

## What it does

Detects when your translated README files are out of sync with the source file by checking:
- Section structure (count and hierarchy)
- Section positions (line numbers)
- Section titles (optional exact match)
- Total line count

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
readme-i18n-sentinel --no-line-count

# JSON output for CI integration
readme-i18n-sentinel --json

# Specify custom paths
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"

# Combine multiple options
readme-i18n-sentinel --json --section-title
```

Available options:
- `-s, --source <path>` - Source README file path
- `-t, --target <pattern>` - Target file pattern (glob supported, can be specified multiple times)
- `--no-section-structure` - Disable section structure check (count and hierarchy)
- `--no-section-position` - Disable section position check
- `--section-title` - Require exact section title match (no translation allowed)
- `--no-line-count` - Disable line count check
- `--json` - Output in JSON format
- `-v, --version` - Display version
- `--help` - Show help

### Common Use Cases

1. **Check translations before commit (with Husky)**
   ```bash
   # .husky/commit-msg
   
   # Check README translations if README.md is modified
   README_FILE='README.md'
   I18N_SKIP_FLAG='[i18n-skip]'  # You can customize this flag string
   
   if git diff --cached --name-only | grep -q "^${README_FILE}$"; then
     if ! grep -qF "${I18N_SKIP_FLAG}" "$1"; then
       echo "📖 Checking README translations..."
       if ! npx readme-i18n-sentinel; then
         echo ""
         echo "❌ README translation check failed"
         echo ""
         echo "The translations in README.*.md files need to be updated."
         echo "Please fix the issues above or add '${I18N_SKIP_FLAG}' to your commit message to skip this check."
         echo ""
         echo "Example: feat: update documentation ${I18N_SKIP_FLAG}"
         echo ""
         exit 1
       fi
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
- `-s, --source <path>` - Source README file path
- `-t, --target <pattern>` - Target file pattern
- `--no-section-structure` - Disable section structure check
- `--no-section-position` - Disable section position check  
- `--section-title` - Require exact title match
- `--no-line-count` - Disable line count check
- `--json` - Output in JSON format
- `-v, --version` - Display version
- `-h, --help` - Show help

### `readme-i18n-sentinel init`

Create a configuration file interactively.

```bash
readme-i18n-sentinel init [options]
```

Options:
- `-y, --yes` - Skip prompts and use defaults

### `readme-i18n-sentinel validate`

Validate configuration file.

```bash
readme-i18n-sentinel validate [config-file]
```

## Check Types

### Section Structure Check (`sectionStructure`)
**Default: enabled**  
Ensures sections have the same count, hierarchy, and order. Checks that:
- Same number of headings exist
- Heading levels match (e.g., `#` vs `##`)
- Sections appear in the same order

### Section Position Check (`sectionPosition`)
**Default: enabled**  
Verifies that each section starts at the same line number. Helps identify where content has expanded or contracted.

### Section Title Check (`sectionTitle`)
**Default: disabled**  
Requires section titles to match exactly (no translation). Useful for:
- Maintaining URL anchors
- Ensuring consistent navigation
- Projects requiring untranslated headings

### Line Count Check (`lineCount`)
**Default: enabled**  
Ensures source and translation files have the same total number of lines.

## Tips

- **Start small**: Begin with just line count checks, then enable other checks gradually
- **Use with Git hooks**: Integrate with Husky to catch issues before commit
- **CI Integration**: Add to your CI pipeline to ensure PRs don't break translations
- **Heading rule**: Keep headings in English across all language versions to maintain consistency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
