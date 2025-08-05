# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

Git diffを使用してREADMEファイルの古い翻訳を検出する軽量CLIツール。開発ワークフローの早い段階で翻訳のずれをキャッチし、多言語ドキュメントの同期を保ちます。

## What it does

ソースファイルと翻訳されたREADMEファイルが同期していないことを以下のチェックで検出します：
- 行数の違い
- 変更されたが翻訳されていない特定の行
- 言語間での見出しの一貫性

**使用例：**

英語のREADMEを更新した場合：
```diff
- ## Installation
+ ## Installation

- Install using npm:
+ Install using npm or yarn:
```

しかし、日本語版の更新を忘れた場合、`readme-i18n-sentinel`を実行すると検出されます：
```
❌ README.ja.md: Line 3 not updated
```

## Installation

**必要要件:** Node.js v20以上

```bash
# グローバルインストール（推奨）
npm install -g readme-i18n-sentinel

# プロジェクト固有のインストール
npm install --save-dev readme-i18n-sentinel

# または npx で直接使用
npx readme-i18n-sentinel
```

## Quick Start

```bash
# 設定ファイルを生成
readme-i18n-sentinel init

# 翻訳をチェック
readme-i18n-sentinel

# initでプロンプトをスキップ
readme-i18n-sentinel init --yes
```

## Configuration

ツールは以下の場所で設定を検索します（[cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)による）：

- `package.json` ("readme-i18n-sentinel"プロパティ内)
- `.readme-i18n-sentinelrc` (拡張子なし)
- `.readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `.config/readme-i18n-sentinelrc` (拡張子なし)
- `.config/readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `readme-i18n-sentinel.config.{js,ts,mjs,cjs}`

### 設定例

**TypeScript/JavaScript（推奨）：**
```typescript
// readme-i18n-sentinel.config.ts
import { defineConfig } from 'readme-i18n-sentinel/config';

export default defineConfig({
  source: 'README.md',
  target: 'README.*.md',  // すべての翻訳用のGlobパターン
  checks: {
    lines: true,         // 行数が一致するかチェック
    changes: true,       // 変更された行が更新されているかチェック
    headingsMatchSource: true  // 見出しが完全に一致するかチェック
  },
  output: {
    json: false  // JSON出力にする場合はtrueに設定
  }
});
```

**JSON：**
```json
{
  "source": "docs/README.md",
  "target": "docs/README.*.md"
}
```

**YAML：**
```yaml
source: README.md
target: README.*.md
checks:
  headingsMatchSource: true
```

## Usage

### よくある使用例

1. **コミット前に翻訳をチェック（Huskyと連携）**
   ```bash
   # .husky/commit-msg
   
   # Check README translations if README.md is modified
   README_FILE='README.md'
   I18N_SKIP_FLAG='[i18n-skip]'  # このフラグ文字列はカスタマイズ可能です
   
   if git diff --cached --name-only | grep -q "^${README_FILE}$"; then
     if ! grep -q "${I18N_SKIP_FLAG}" "$1"; then
       echo "📖 Checking README translations..."
       npx readme-i18n-sentinel || exit 1
     else
       echo "📖 Skipping README translation check due to ${I18N_SKIP_FLAG} flag"
     fi
   fi
   ```

2. **CI/CDパイプライン**
   ```yaml
   # GitHub Actionsの例
   - name: Check README translations
     run: npx readme-i18n-sentinel
   ```

3. **一時的にチェックをスキップ**
   ```bash
   # コミットメッセージに[i18n-skip]を追加
   git commit -m "feat: update deps [i18n-skip]"
   ```
   
   以下のような場合に便利です：
   - 緊急のホットフィックスで、翻訳は後で更新する場合
   - コンテンツ以外の変更（フォーマット、コード例）を更新する場合
   - ドキュメントを段階的に作業している場合
   
   **注意：** 後で必ず翻訳を更新することを忘れないでください！

## Commands

### `readme-i18n-sentinel` (デフォルト)

古いコンテンツの翻訳ファイルをチェックします。

```bash
readme-i18n-sentinel [options]
```

オプション：
- `-c, --config <path>` - 設定ファイルへのパス
- `-v, --version` - バージョンを表示
- `--help` - ヘルプを表示

### `readme-i18n-sentinel init`

設定ファイルを対話的に作成します。

```bash
readme-i18n-sentinel init [options]
```

オプション：
- `-y, --yes` - プロンプトをスキップしてデフォルトを使用

### `readme-i18n-sentinel validate`

設定ファイルを検証します。

```bash
readme-i18n-sentinel validate [config-file]
```

## Check Types

### Line Count Check (`lines`)
ソースファイルと翻訳ファイルの行数が同じであることを確認します。不足または余分なコンテンツをキャッチします。

### Change Detection (`changes`)
`git diff`を使用してソースファイルで変更された行を検出し、翻訳でも同じ行が更新されているかを確認します。

### Heading Consistency (`headingsMatchSource`)
ソースと翻訳間ですべてのマークダウン見出し（`#`、`##`など）が完全に一致することを確認します。これは以下の点で重要です：
- ドキュメント構造の維持
- アンカーリンクの動作維持
- 一貫したナビゲーションの確保

**重要：** URLアンカーを維持するため、見出しはすべての翻訳版でソース言語（通常は英語）のままにする必要があります。

## Output Formats

### Text Format (デフォルト)
ターミナル用の人間が読める出力：
```
❌ README.ja.md: Line 42 not updated
❌ README.zh-CN.md: Line count mismatch (120 ≠ 118)
❌ README.ja.md: Heading mismatch => "## Getting Started"
```

### JSON Format
自動化用の機械可読出力：
```json
{
  "isValid": false,
  "errors": [
    {
      "file": "README.ja.md",
      "type": "line-missing",
      "line": 42,
      "details": "Line 42 was changed in source but not in target"
    },
    {
      "file": "README.zh-CN.md",
      "type": "lines-mismatch",
      "details": "Line count mismatch: source has 118 lines, target has 120 lines"
    }
  ]
}
```

## Tips

- **スモールスタート**: まず行数チェックだけから始め、徐々に他のチェックを有効化
- **Gitフックと連携**: Huskyと統合してコミット前に問題をキャッチ
- **CI統合**: CIパイプラインに追加してPRが翻訳を壊さないことを確認
- **見出しルール**: すべての言語バージョンで見出しは英語のまま維持

## Contributing

コントリビューションを歓迎します！お気軽にPull Requestを提出してください。

## License

MIT

## See Also

- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - 設定ファイルローダー
- [simple-git](https://github.com/steveukx/git-js) - Git統合
- [Husky](https://typicode.github.io/husky/) - Gitフックを簡単に
- 