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

एक CLI टूल जो स्रोत और अनुवादित README फ़ाइलों के बीच संरचनात्मक संगति को सत्यापित करता है।

## What it does

आपकी स्रोत README की अनुवादित संस्करणों के साथ तुलना करता है ताकि यह सुनिश्चित हो सके कि उनकी संरचना समान है:
- **अनुभाग की संख्या और पदानुक्रम** - समान स्तरों पर समान संख्या में शीर्षक
- **लाइन की स्थिति** - अनुभाग समान लाइन संख्याओं से शुरू होते हैं
- **लाइन की संख्या** - फाइलों में समान कुल लाइन संख्या होती है
- **अनुभाग शीर्षक** (वैकल्पिक) - शीर्षक मूल भाषा में रहते हैं
- **कोड ब्लॉक** (वैकल्पिक) - कोड उदाहरण अपरिवर्तित रहते हैं

**उदाहरण:** यदि आपके अंग्रेजी README में 5 अनुभाग और 150 लाइनें हैं, लेकिन जापानी संस्करण में 4 अनुभाग और 140 लाइनें हैं, तो टूल इस असंगति का पता लगाएगा और रिपोर्ट करेगा कि कौन से अनुभाग गुम या गलत तरीके से संरेखित हैं।

## Installation

**आवश्यकताएं:** Node.js v20 या उच्चतर

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

- `-s, --source <path>` - स्रोत README फाइल का पथ (default: `README.md`)
- `-t, --target <pattern>` - लक्ष्य फाइल पैटर्न (glob समर्थित) (default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - शीर्षक संख्या और पदानुक्रम सत्यापन छोड़ें (# vs ##)
- `--skip-line-count-check` - कुल लाइन संख्या और शीर्षक लाइन स्थिति सत्यापन छोड़ें
- `--require-original-section-titles` - शीर्षक पाठ का सटीक मिलान आवश्यक (उदा. "## Installation" अंग्रेजी में रहना चाहिए)
- `--require-original-code-blocks` - कोड ब्लॉक का सटीक मिलान आवश्यक (``` के अंदर की सामग्री सहित)
- `--json` - CI/CD एकीकरण के लिए JSON प्रारूप में परिणाम आउटपुट करें

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

**सरल संस्करण** - हर कमिट पर अनुवादों की जांच करें:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**उन्नत संस्करण** - केवल README.md में संशोधन पर जांच करें और स्किप फ्लैग का समर्थन करें:
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

जांच को अस्थायी रूप से छोड़ने के लिए (केवल उन्नत संस्करण), अपने कमिट संदेश में `[i18n-skip]` जोड़ें:
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

योगदान का स्वागत है! कृपया Pull Request सबमिट करने में संकोच न करें।

## License

MIT