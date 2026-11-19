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

Una herramienta CLI que valida la consistencia estructural entre los archivos README fuente y traducidos.

## What it does

Compara su README fuente con las versiones traducidas para asegurar que tienen la misma estructura:
- **Cantidad y jerarquía de secciones** - Mismo número de encabezados en los mismos niveles
- **Posiciones de línea** - Las secciones comienzan en los mismos números de línea
- **Recuento de líneas** - Los archivos tienen el mismo número total de líneas
- **Títulos de sección** (opcional) - Los encabezados permanecen en el idioma original
- **Bloques de código** (opcional) - Los ejemplos de código permanecen sin cambios

**Ejemplo:** Si su README en inglés tiene 5 secciones y 150 líneas, pero la versión japonesa tiene 4 secciones y 140 líneas, la herramienta detectará esta discrepancia e informará qué secciones faltan o están desalineadas.

## Installation

**Requisitos:** Node.js v26 o superior

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

- `-s, --source <path>` - Ruta del archivo README fuente (default: `README.md`)
- `-t, --target <pattern>` - Patrón de archivo objetivo (compatible con glob) (default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - Omitir validación del conteo de encabezados y jerarquía (# vs ##)
- `--skip-line-count-check` - Omitir validación del recuento total de líneas y posiciones de línea de encabezados
- `--require-original-section-titles` - Requerir que el texto del encabezado coincida exactamente (ej., "## Installation" debe permanecer en inglés)
- `--require-original-code-blocks` - Requerir que los bloques de código coincidan exactamente (incluido el contenido dentro de ```)
- `--json` - Mostrar resultados en formato JSON para integración CI/CD

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

**Versión simple** - Verificar traducciones en cada commit:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Versión avanzada** - Solo verificar cuando README.md es modificado y admitir bandera de omisión:
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

Para omitir la verificación temporalmente (solo versión avanzada), agregue `[i18n-skip]` a su mensaje de commit:
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

¡Las contribuciones son bienvenidas! No dude en enviar un Pull Request.

## License

MIT