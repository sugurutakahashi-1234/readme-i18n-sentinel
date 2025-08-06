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

**Requirements:** Node.js v24z or higher

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

## Configuration

All configuration is done through command-line arguments. There are no configuration files.

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

# Specify custom paths
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"

# Combine multiple options
readme-i18n-sentinel --json --no-changes
```

Available options:
- `-s, --source <path>` - Source README file path
- `-t, --target <pattern>` - Target file pattern (glob supported, can be specified multiple times)
- `--no-lines` - Disable line count check
- `--no-changes` - Disable changes check
- `--no-headings-match-source` - Disable headings match check
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

## Tips

- **Start small**: Begin with just line count checks, then enable other checks gradually
- **Use with Git hooks**: Integrate with Husky to catch issues before commit
- **CI Integration**: Add to your CI pipeline to ensure PRs don't break translations
- **Heading rule**: Keep headings in English across all language versions to maintain consistency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
