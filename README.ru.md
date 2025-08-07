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

CLI инструмент, который гарантирует, что ваши переведённые README файлы сохраняют ту же структуру, что и оригинал, помогая поддерживать многоязычную документацию в синхронизации.

## What it does

Сравнивает ваш исходный README с переведёнными версиями, чтобы убедиться, что они имеют одинаковую структуру:
- **Количество разделов и иерархия** - Одинаковое количество заголовков на тех же уровнях
- **Позиции строк** - Разделы начинаются с одинаковых номеров строк
- **Количество строк** - Файлы имеют одинаковое общее количество строк
- **Заголовки разделов** (опционально) - Заголовки остаются на оригинальном языке
- **Блоки кода** (опционально) - Примеры кода остаются неизменными

**Пример:** Если ваш английский README имеет 5 разделов и 150 строк, но японская версия имеет 4 раздела и 140 строк, инструмент обнаружит это несоответствие и сообщит, какие разделы отсутствуют или не выровнены.

## Installation

**Требования:** Node.js v20 или выше

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

| Option                              | Description                                                                          | Default                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `-s, --source <path>`               | Путь к исходному README файлу                                                        | `README.md`                                                          |
| `-t, --target <pattern>`            | Паттерн целевого файла (поддерживает glob)                                          | `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}` |
| `--skip-section-structure-check`    | Пропустить проверку количества заголовков и иерархии (# vs ##)                       | disabled                                                             |
| `--skip-line-count-check`           | Пропустить проверку общего количества строк и позиций строк заголовков              | disabled                                                             |
| `--require-original-section-titles` | Требовать точного соответствия текста заголовков (например, "## Installation" должен остаться на английском) | disabled                                                             |
| `--require-original-code-blocks`    | Требовать точного соответствия блоков кода (включая содержимое внутри ```)          | disabled                                                             |
| `--json`                            | Вывод результатов в формате JSON для интеграции CI/CD                               | disabled                                                             |

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

**Простая версия** - Проверка переводов при каждом коммите:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Расширенная версия** - Проверка только при изменении README.md и поддержка флага пропуска:
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

Чтобы временно пропустить проверку (только расширенная версия), добавьте `[i18n-skip]` в сообщение коммита:
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

Вклады приветствуются! Не стесняйтесь отправлять Pull Request.

## License

MIT