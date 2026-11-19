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

أداة CLI تتحقق من الاتساق الهيكلي بين ملفات README المصدرية والمترجمة.

## What it does

يقارن README المصدر مع النسخ المترجمة للتأكد من أن لها نفس الهيكل:
- **عدد الأقسام والتسلسل الهرمي** - نفس عدد العناوين في نفس المستويات
- **مواضع الأسطر** - تبدأ الأقسام في نفس أرقام الأسطر
- **عدد الأسطر** - الملفات لها نفس العدد الإجمالي للأسطر
- **عناوين الأقسام** (اختياري) - تبقى العناوين باللغة الأصلية
- **كتل الكود** (اختياري) - تبقى أمثلة الكود بدون تغيير

**مثال:** إذا كان README الإنجليزي يحتوي على 5 أقسام و 150 سطر، ولكن النسخة اليابانية تحتوي على 4 أقسام و 140 سطر، ستكتشف الأداة هذا التناقض وتبلغ عن الأقسام المفقودة أو غير المحاذاة.

## Installation

**المتطلبات:** Node.js v26 أو أعلى

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

- `-s, --source <path>` - مسار ملف README المصدر (default: `README.md`)
- `-t, --target <pattern>` - نمط الملف المستهدف (يدعم glob) (default: `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}`)
- `--skip-section-structure-check` - تخطي التحقق من عدد العناوين والتسلسل الهرمي (# مقابل ##)
- `--skip-line-count-check` - تخطي التحقق من العدد الإجمالي للأسطر ومواضع أسطر العناوين
- `--require-original-section-titles` - يتطلب مطابقة نص العنوان بدقة (مثلاً "## Installation" يجب أن يبقى بالإنجليزية)
- `--require-original-code-blocks` - يتطلب مطابقة كتل الكود بدقة (بما في ذلك المحتوى داخل ```)
- `--json` - إخراج النتائج بتنسيق JSON لتكامل CI/CD

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

**نسخة بسيطة** - فحص الترجمات في كل commit:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**نسخة متقدمة** - فحص فقط عند تعديل README.md ودعم علامة التخطي:
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

لتخطي الفحص مؤقتاً (النسخة المتقدمة فقط)، أضف `[i18n-skip]` إلى رسالة commit:
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

المساهمات مرحب بها! لا تتردد في إرسال Pull Request.

## License

MIT