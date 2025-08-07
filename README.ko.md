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

번역된 README 파일이 원본과 동일한 구조를 유지하도록 하는 CLI 도구로, 다국어 문서 동기화를 도와줍니다.

## What it does

원본 README와 번역 버전을 비교하여 동일한 구조를 가지는지 확인합니다:
- **섹션 개수 및 계층** - 동일한 레벨의 동일한 제목 개수
- **라인 위치** - 섹션이 동일한 라인 번호에서 시작
- **라인 개수** - 파일의 전체 라인 수가 동일
- **섹션 제목** (선택사항) - 제목이 원래 언어로 유지
- **코드 블록** (선택사항) - 코드 예제가 변경되지 않음

**예시:** 영어 README가 5개 섹션과 150줄을 가지고 있지만 일본어 버전이 4개 섹션과 140줄을 가진다면, 도구가 이 불일치를 감지하고 누락되거나 정렬되지 않은 섹션을 보고합니다.

## Installation

**요구사항:** Node.js v20 이상

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
| `-s, --source <path>`               | 원본 README 파일 경로                                                                | `README.md`                                                          |
| `-t, --target <pattern>`            | 대상 파일 패턴 (glob 지원)                                                           | `{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}` |
| `--skip-section-structure-check`    | 제목 개수 및 계층 검증 건너뛰기 (# vs ##)                                             | disabled                                                             |
| `--skip-line-count-check`           | 총 라인 수 및 제목 라인 위치 검증 건너뛰기                                            | disabled                                                             |
| `--require-original-section-titles` | 제목 텍스트 정확히 일치 요구 (예: "## Installation"은 영어로 유지해야 함)                | disabled                                                             |
| `--require-original-code-blocks`    | 코드 블록 정확히 일치 요구 (``` 내용 포함)                                            | disabled                                                             |
| `--json`                            | CI/CD 통합을 위한 JSON 형식으로 결과 출력                                             | disabled                                                             |

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

**간단한 버전** - 매 커밋마다 번역 확인:
```bash
# .husky/pre-commit

npx readme-i18n-sentinel
```

**고급 버전** - README.md가 수정될 때만 확인하고 건너뛰기 플래그 지원:
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

임시로 확인을 건너뛰려면 (고급 버전만), 커밋 메시지에 `[i18n-skip]`를 추가하세요:
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

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요.

## License

MIT