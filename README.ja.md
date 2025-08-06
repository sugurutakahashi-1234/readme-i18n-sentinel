# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

Git diffを使用してREADMEファイルの古い翻訳を検出する軽量なCLIツール。開発ワークフローの早い段階で翻訳のずれをキャッチし、多言語ドキュメントを同期させ続けます。

## What it does

ソースファイルと翻訳されたREADMEファイルが同期していないことを以下の項目をチェックして検出します：
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

しかし、日本語版の更新を忘れた場合、`readme-i18n-sentinel`を実行すると以下のようにキャッチします：
```
❌ README.ja.md: Line 3 not updated
```

## Installation

**要件:** Node.js v20以上

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
# 引数なしで実行 - READMEファイルを自動検出します
readme-i18n-sentinel

# ツールは自動的に以下を行います：
# 1. README.mdをソースとして検出
# 2. すべてのREADME.*.mdファイルを翻訳として検出
# 3. 翻訳が最新かどうかをチェック

# カスタム設定が必要な場合は設定ファイルを生成
readme-i18n-sentinel init
```

## Configuration

ツールは以下の場所で設定を検索します（[cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)により提供）：

- `package.json` ("readme-i18n-sentinel"プロパティ下)
- `.readme-i18n-sentinelrc` (拡張子なし)
- `.readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `.config/readme-i18n-sentinelrc` (拡張子なし)
- `.config/readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}`
- `readme-i18n-sentinel.config.{js,ts,mjs,cjs}`

### Example configurations

**TypeScript/JavaScript (推奨):**
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
    json: false  // JSON出力の場合はtrueに設定
  }
});
```

**JSON:**
```json
{
  "source": "docs/README.md",
  "target": "docs/README.*.md"
}
```

**YAML:**
```yaml
source: README.md
target: README.*.md
checks:
  headingsMatchSource: true
```

## Usage

### Auto-detection (Recommended)

```bash
# 引数なしで実行
readme-i18n-sentinel

# ツールは自動的に：
# - README.mdをソースとして検索
# - すべてのREADME.*.mdファイルをターゲットとして検出（例：README.ja.md、README.zh-CN.md）
```

### Command Line Options

```bash
# 特定のチェックを無効化
readme-i18n-sentinel --no-lines

# CI統合用のJSON出力
readme-i18n-sentinel --json

# 特定の設定ファイルを使用
readme-i18n-sentinel -c myconfig.yml

# カスタムパスを指定
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"

# 設定ファイルとCLIオーバーライドを組み合わせる
readme-i18n-sentinel -c config.json --json --no-changes
```

利用可能なオプション：
- `-c, --config <path>` - 設定ファイルへのパス
- `-s, --source <path>` - ソースREADMEファイルパス
- `-t, --target <pattern>` - ターゲットファイルパターン（Globサポート、複数回指定可能）
- `--no-lines` - 行数チェックを無効化
- `--no-changes` - 変更チェックを無効化
- `--no-headings-match-source` - 見出し一致チェックを無効化
- `--json` - JSON形式で出力

**優先順位:** CLIの引数 > 設定ファイル > 自動検出

### Common Use Cases

1. **コミット前に翻訳をチェック（Huskyと連携）**
   ```bash
   # .husky/commit-msg
   
   # README.mdが変更された場合、README翻訳をチェック
   README_FILE='README.md'
   I18N_SKIP_FLAG='[i18n-skip]'  # このフラグ文字列はカスタマイズ可能
   
   if git diff --cached --name-only | grep -q "^${README_FILE}$"; then
     if ! grep -qF "${I18N_SKIP_FLAG}" "$1"; then
       echo "📖 Checking README translations..."
       if ! npx readme-i18n-sentinel; then
         echo ""
         echo "❌ README translation check failed"
         echo ""
         echo "The translations in README.*.md files need to be updated."
         echo "Please fix the issues above or add '${I18N_SKIP_FLAG}' to your commit message to skip this check."
         echo ""
         echo "Example: feat: update documentation ${I18N_SKIP_FLAG}"
         echo ""
         exit 1
       fi
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
   
   以下の場合に便利です：
   - 翻訳を後で更新できる緊急のホットフィックスを行う場合
   - コンテンツ以外の変更（フォーマット、コード例）を更新する場合
   - ドキュメントを段階的に作業する場合
   
   **注意:** フォローアップコミットで翻訳を更新することを忘れないでください！

## Commands

### `readme-i18n-sentinel` (default)

古いコンテンツの翻訳ファイルをチェックします。

```bash
readme-i18n-sentinel [options]
```

オプション：
- `-c, --config <path>` - 設定ファイルへのパス
- `-v, --version` - バージョンを表示
- `--help` - ヘルプを表示

### `readme-i18n-sentinel init`

対話的に設定ファイルを作成します。

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
ソースファイルと翻訳ファイルが同じ行数であることを確認します。欠落または余分なコンテンツをキャッチします。

### Change Detection (`changes`)
`git diff`を使用してソースファイルで変更された行を検出し、同じ行が翻訳で更新されたことを確認します。

### Heading Consistency (`headingsMatchSource`)
すべてのマークダウン見出し（`#`、`##`など）がソースと翻訳間で完全に一致することを確認します。これは以下の点で重要です：
- ドキュメント構造の維持
- アンカーリンクの動作維持
- 一貫したナビゲーションの確保

**重要:** URLアンカーを維持するため、見出しはすべての翻訳でソース言語（通常は英語）のままにする必要があります。

## Tips

- **小さく始める**: 行数チェックだけから始めて、徐々に他のチェックを有効にする
- **Gitフックと連携**: Huskyと統合してコミット前に問題をキャッチ
- **CI統合**: CIパイプラインに追加してPRが翻訳を壊さないようにする
- **見出しルール**: すべての言語版で見出しを英語のままにする

## Contributing

コントリビューションは歓迎です！お気軽にプルリクエストを送信してください。

## License

MIT

## See Also

- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - 設定ファイルローダー
- [simple-git](https://github.com/steveukx/git-js) - Git統合
- [Husky](https://typicode.github.io/husky/) - Gitフックを簡単に
テスト用のREADME変更