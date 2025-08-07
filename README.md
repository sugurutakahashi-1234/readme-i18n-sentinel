# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

A CLI tool that ensures your translated README files maintain the same structure as the source, helping you keep multi-language documentation in sync.

## What it does

Compares your source README with translated versions to ensure they have the same structure:
- **Section count & hierarchy** - Same number of headings at the same levels
- **Line positions** - Sections start at the same line numbers
- **Line count** - Files have the same total number of lines
- **Section titles** (optional) - Headings remain in original language
- **Code blocks** (optional) - Code examples stay unchanged

**Example:** If your English README has 5 sections and 150 lines, but the Japanese version has 4 sections and 140 lines, the tool will detect this mismatch and report which sections are missing or misaligned.

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

# Automatically checks:
# - Source: README.md
# - Targets: README.*.md, docs/README.*.md, docs/*/README.md, docs/*/README.*.md
```

## Usage

### Options

| Option                              | Description                                                                           | Default                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `-s, --source <path>`               | Source README file path                                                              | `README.md`                                                          |
| `-t, --target <pattern>`            | Target file pattern (glob supported)                                                  | `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}` |
| `--skip-section-structure-check`    | Skip validation of heading count and hierarchy (# vs ##)                              | disabled                                                             |
| `--skip-line-count-check`           | Skip validation of total line count and heading line positions                        | disabled                                                             |
| `--require-original-section-titles` | Require heading text to match exactly (e.g., "## Installation" must stay in English)  | disabled                                                             |
| `--require-original-code-blocks`    | Require code blocks to match exactly (including content inside ```)                   | disabled                                                             |
| `--json`                            | Output results in JSON format for CI/CD integration                                   | disabled                                                             |

### Examples

```bash
# Basic usage with auto-detection
readme-i18n-sentinel

# JSON output for CI/CD
readme-i18n-sentinel --json

# Custom paths
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"
```

## Integration

### Husky (Git Hooks)

**Simple version** - Check translations on every commit:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Advanced version** - Only check when README.md is modified & support skip flag:
```bash
# .husky/commit-msg

README_FILE='README.md'
I18N_SKIP_FLAG='[i18n-skip]'

if git diff --cached --name-only | grep -q "^${README_FILE}$"; then
  if ! grep -qF "${I18N_SKIP_FLAG}" "$1"; then
    if ! npx readme-i18n-sentinel; then
      echo "❌ README translation check failed"
      echo "Please fix the issues above or add '${I18N_SKIP_FLAG}' to your commit message to skip this check."
      echo "Example: feat: update documentation ${I18N_SKIP_FLAG}"
      exit 1
    fi
  else
    echo "📖 Skipping README translation check due to ${I18N_SKIP_FLAG} flag"
  fi
fi
```

To skip the check temporarily (advanced version only), add `[i18n-skip]` to your commit message:
```bash
git commit -m "feat: urgent fix [i18n-skip]"
```

### CI/CD

```yaml
# GitHub Actions
- name: Check README translations
  run: npx readme-i18n-sentinel

# GitLab CI
check-translations:
  script: npx readme-i18n-sentinel
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
