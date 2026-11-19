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

Ein CLI-Tool, das die strukturelle Konsistenz zwischen Quell- und übersetzten README-Dateien validiert.

## What it does

Vergleicht Ihre Quell-README mit übersetzten Versionen, um sicherzustellen, dass sie dieselbe Struktur haben:
- **Abschnittszahl und Hierarchie** - Gleiche Anzahl von Überschriften auf denselben Ebenen
- **Zeilenpositionen** - Abschnitte beginnen bei denselben Zeilennummern
- **Zeilenanzahl** - Dateien haben dieselbe Gesamtzeilenzahl
- **Abschnittstitel** (optional) - Überschriften bleiben in der ursprünglichen Sprache
- **Codeblöcke** (optional) - Codebeispiele bleiben unverändert

**Beispiel:** Wenn Ihre englische README 5 Abschnitte und 150 Zeilen hat, aber die japanische Version 4 Abschnitte und 140 Zeilen hat, wird das Tool diese Diskrepanz erkennen und melden, welche Abschnitte fehlen oder nicht ausgerichtet sind.

## Installation

**Anforderungen:** Node.js v26 oder höher

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

- `-s, --source <path>` - Quell-README-Dateipfad (default: `README.md`)
- `-t, --target <pattern>` - Zieldateimuster (glob-unterstützt) (default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - Validierung von Überschriftenzahl und Hierarchie überspringen (# vs ##)
- `--skip-line-count-check` - Validierung der Gesamtzeilenzahl und Überschriftenzeilenpositionen überspringen
- `--require-original-section-titles` - Überschriftentext muss exakt übereinstimmen (z.B. "## Installation" muss englisch bleiben)
- `--require-original-code-blocks` - Codeblöcke müssen exakt übereinstimmen (einschließlich Inhalt in ```)
- `--json` - Ergebnisse im JSON-Format für CI/CD-Integration ausgeben

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

**Einfache Version** - Übersetzungen bei jedem Commit prüfen:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Erweiterte Version** - Nur prüfen, wenn README.md geändert wurde und Skip-Flag unterstützen:
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

Um die Prüfung temporär zu überspringen (nur erweiterte Version), fügen Sie `[i18n-skip]` zu Ihrer Commit-Nachricht hinzu:
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

Beiträge sind willkommen! Reichen Sie gerne einen Pull Request ein.

## License

MIT