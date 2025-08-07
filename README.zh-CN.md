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

一个 CLI 工具，确保您的翻译 README 文件与源文件保持相同的结构，帮助您保持多语言文档同步。

## What it does

比较您的源 README 与翻译版本，确保它们具有相同的结构：
- **章节数量和层次结构** - 相同级别的相同数量的标题
- **行位置** - 章节从相同的行号开始
- **行数** - 文件具有相同的总行数
- **章节标题**（可选）- 标题保持原始语言
- **代码块**（可选）- 代码示例保持不变

**示例：** 如果您的英文 README 有 5 个章节和 150 行，但日文版本有 4 个章节和 140 行，该工具将检测到这种不匹配，并报告缺少或未对齐的章节。

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

- `-s, --source <path>` - 源 README 文件路径 (default: `README.md`)
- `-t, --target <pattern>` - 目标文件模式（支持 glob）(default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - 跳过标题数量和层次结构验证（# vs ##）
- `--skip-line-count-check` - 跳过总行数和标题行位置验证
- `--require-original-section-titles` - 要求标题文本完全匹配（例如，"## Installation" 必须保持英文）
- `--require-original-code-blocks` - 要求代码块完全匹配（包括 ``` 内的内容）
- `--json` - 以 JSON 格式输出结果，用于 CI/CD 集成

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

**简单版本** - 每次提交时检查翻译：
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**高级版本** - 仅在修改 README.md 时检查并支持跳过标志：
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

要临时跳过检查（仅限高级版本），请在提交消息中添加 `[i18n-skip]`：
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

欢迎贡献！请随时提交 Pull Request。

## License

MIT