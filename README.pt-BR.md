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

Uma ferramenta CLI que garante que seus arquivos README traduzidos mantenham a mesma estrutura que o original, ajudando você a manter a documentação multilíngue sincronizada.

## What it does

Compara seu README fonte com as versões traduzidas para garantir que tenham a mesma estrutura:
- **Contagem e hierarquia de seções** - Mesmo número de títulos nos mesmos níveis
- **Posições de linha** - Seções começam nos mesmos números de linha
- **Contagem de linhas** - Arquivos têm o mesmo número total de linhas
- **Títulos de seção** (opcional) - Títulos permanecem no idioma original
- **Blocos de código** (opcional) - Exemplos de código permanecem inalterados

**Exemplo:** Se seu README em inglês tem 5 seções e 150 linhas, mas a versão japonesa tem 4 seções e 140 linhas, a ferramenta detectará essa incompatibilidade e relatará quais seções estão faltando ou desalinhadas.

## Installation

**Requisitos:** Node.js v20 ou superior

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

| Option                              | Description                                                                        | Default                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `-s, --source <path>`               | Caminho do arquivo README fonte                                                    | `README.md`                                                          |
| `-t, --target <pattern>`            | Padrão de arquivo alvo (compatível com glob)                                       | `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}` |
| `--skip-section-structure-check`    | Pular validação de contagem de títulos e hierarquia (# vs ##)                      | disabled                                                             |
| `--skip-line-count-check`           | Pular validação de contagem total de linhas e posições de linha dos títulos        | disabled                                                             |
| `--require-original-section-titles` | Exigir que o texto do título corresponda exatamente (ex., "## Installation" deve permanecer em inglês) | disabled                                                             |
| `--require-original-code-blocks`    | Exigir que blocos de código correspondam exatamente (incluindo conteúdo dentro de ```) | disabled                                                             |
| `--json`                            | Exibir resultados em formato JSON para integração CI/CD                            | disabled                                                             |

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

**Versão simples** - Verificar traduções em cada commit:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**Versão avançada** - Verificar apenas quando README.md for modificado e suportar flag de pular:
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

Para pular a verificação temporariamente (apenas versão avançada), adicione `[i18n-skip]` à sua mensagem de commit:
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

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## License

MIT