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

Un outil CLI qui valide la cohérence structurelle entre les fichiers README source et traduits.

## What it does

Compare votre README source avec les versions traduites pour s'assurer qu'elles ont la même structure :
- **Nombre et hiérarchie des sections** - Même nombre de titres aux mêmes niveaux
- **Positions des lignes** - Les sections commencent aux mêmes numéros de ligne
- **Nombre de lignes** - Les fichiers ont le même nombre total de lignes
- **Titres de section** (optionnel) - Les titres restent dans la langue d'origine
- **Blocs de code** (optionnel) - Les exemples de code restent inchangés

**Exemple :** Si votre README anglais a 5 sections et 150 lignes, mais la version japonaise a 4 sections et 140 lignes, l'outil détectera cette incohérence et signalera quelles sections sont manquantes ou désalignées.

## Installation

**Exigences :** Node.js v26 ou supérieur

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

- `-s, --source <path>` - Chemin du fichier README source (default: `README.md`)
- `-t, --target <pattern>` - Motif de fichier cible (compatible glob) (default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - Ignorer la validation du nombre de titres et de la hiérarchie (# vs ##)
- `--skip-line-count-check` - Ignorer la validation du nombre total de lignes et des positions des lignes de titre
- `--require-original-section-titles` - Exiger que le texte du titre corresponde exactement (ex. "## Installation" doit rester en anglais)
- `--require-original-code-blocks` - Exiger que les blocs de code correspondent exactement (y compris le contenu dans ```)
- `--json` - Sortie des résultats au format JSON pour l'intégration CI/CD

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

**Version simple** - Vérifier les traductions à chaque commit :
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Version avancée** - Vérifier seulement quand README.md est modifié et supporter le drapeau d'ignorer :
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

Pour ignorer temporairement la vérification (version avancée seulement), ajoutez `[i18n-skip]` à votre message de commit :
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

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

## License

MIT