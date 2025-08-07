# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm Release](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/cd-npm-release.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/cd-npm-release.yml)
[![GitHub Release Date](https://img.shields.io/github/release-date/sugurutakahashi-1234/readme-i18n-sentinel)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/pulls)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [Español](README.es.md) | [Português](README.pt-BR.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Русский](README.ru.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md) | [繁體中文](README.zh-TW.md)

一個 CLI 工具，確保您的翻譯 README 檔案與源檔案保持相同的結構，幫助您保持多語言文件同步。

## What it does

比較您的源 README 與翻譯版本，確保它們具有相同的結構：
- **章節數量和層次結構** - 相同級別的相同數量標題
- **行位置** - 章節從相同的行號開始
- **行數** - 檔案具有相同的總行數
- **章節標題**（可選）- 標題保持原始語言
- **程式碼區塊**（可選）- 程式碼範例保持不變

**範例：** 如果您的英文 README 有 5 個章節和 150 行，但日文版本有 4 個章節和 140 行，該工具將檢測到這種不匹配，並報告缺少或未對齊的章節。

## Installation

**要求：** Node.js v20 或更高版本

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

- `-s, --source <path>` - 源 README 檔案路徑 (default: `README.md`)
- `-t, --target <pattern>` - 目標檔案模式（支援 glob）(default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - 跳過標題數量和層次結構驗證（# vs ##）
- `--skip-line-count-check` - 跳過總行數和標題行位置驗證
- `--require-original-section-titles` - 要求標題文字完全匹配（例如，"## Installation" 必須保持英文）
- `--require-original-code-blocks` - 要求程式碼區塊完全匹配（包括 ``` 內的內容）
- `--json` - 以 JSON 格式輸出結果，用於 CI/CD 整合

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

**簡單版本** - 每次提交時檢查翻譯：
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**進階版本** - 僅在修改 README.md 時檢查並支援跳過標記：
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

要臨時跳過檢查（僅進階版本），請在提交訊息中添加 `[i18n-skip]`：
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

歡迎貢獻！請隨時提交 Pull Request。

## License

MIT