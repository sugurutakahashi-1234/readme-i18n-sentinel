# readme-i18n-sentinel

[![npm version](https://img.shields.io/npm/v/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![npm downloads](https://img.shields.io/npm/dm/readme-i18n-sentinel.svg)](https://www.npmjs.com/package/readme-i18n-sentinel)
[![install size](https://packagephobia.com/badge?p=readme-i18n-sentinel)](https://packagephobia.com/result?p=readme-i18n-sentinel)
[![Build](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml/badge.svg)](https://github.com/sugurutakahashi-1234/readme-i18n-sentinel/actions/workflows/ci-push-main.yml)
[![codecov](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel/graph/badge.svg)](https://codecov.io/gh/sugurutakahashi-1234/readme-i18n-sentinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [日本語](README.ja.md)

READMEファイルの古い翻訳を検出する軽量なCLIツール。開発ワークフローの早い段階で翻訳のずれをキャッチし、多言語ドキュメントを同期させ続けます。

## What it does

ソースファイルと翻訳されたREADMEファイルが同期していないことを以下の項目をチェックして検出します：
- セクション構造（数と階層）
- セクション位置（行番号）
- セクションタイトル（オプションで完全一致）
- 総行数

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

**要件:** Node.js v20 以上

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
```


## Usage

### Auto-detection (Recommended)

```bash
# 引数なしで実行
readme-i18n-sentinel

# 上記は以下と同等：
readme-i18n-sentinel \
  --source "README.md" \
  --target "{README.*.md,docs/README.*.md,docs/*/README.md,docs/*/README.*.md}"
```

### Command Line Options

```bash
# 特定のチェックをスキップ
readme-i18n-sentinel --skip-line-count-check

# CI統合用のJSON出力
readme-i18n-sentinel --json

# カスタムパスを指定
readme-i18n-sentinel --source docs/README.md --target "docs/README.*.md"

# 複数のオプションを組み合わせる
readme-i18n-sentinel --json --require-original-section-titles
```

利用可能なオプション：
- `-s, --source <path>` - ソースREADMEファイルパス
- `-t, --target <pattern>` - ターゲットファイルパターン（globサポート、複数回指定可）
- `--skip-section-structure-check` - セクション構造検証をスキップ（数と階層）
- `--skip-line-count-check` - 行数とセクション位置検証をスキップ
- `--require-original-section-titles` - セクションタイトルを元の言語のまま保持
- `--require-original-code-blocks` - コードブロックを完全に元のまま保持
- `--json` - JSON形式で出力
- `-v, --version` - バージョンを表示
- `--help` - ヘルプを表示

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
- `-s, --source <path>` - ソースREADMEファイルパス
- `-t, --target <pattern>` - ターゲットファイルパターン
- `--skip-section-structure-check` - セクション構造チェックをスキップ
- `--skip-line-count-check` - 行数とセクション位置チェックをスキップ
- `--require-original-section-titles` - 見出しを元の言語のまま保持
- `--require-original-code-blocks` - コードブロックを変更しない
- `--json` - JSON形式で出力
- `-v, --version` - バージョンを表示
- `-h, --help` - ヘルプを表示

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

### Section Structure Check (`sectionStructure`)
**デフォルト: 有効**  
セクションの数、階層、順序が一致していることを確認します。以下をチェック：
- 同じ数の見出しが存在するか
- 見出しレベルが一致するか（例：`#` vs `##`）
- セクションが同じ順序で出現するか

### Section Position Check
**デフォルト: 有効（行数チェックがスキップされると無効）**  
各セクションが同じ行番号から始まることを確認します。コンテンツがどこで拡大・縮小したかを特定できます。`--skip-line-count-check`を使用すると、このチェックは自動的にスキップされます。

### Heading Translation Check (`requireOriginalSectionTitles`)
**デフォルト: 無効**  
セクションタイトル/見出しを元の言語のまま保持することを要求（翻訳不可）。以下の場合に有用：
- URLアンカーの維持
- 一貫したナビゲーションの確保
- 見出しを翻訳しないプロジェクト

### Code Block Check (`requireOriginalCodeBlocks`)
**デフォルト: 無効**  
コードブロックを完全に元のまま保持することを要求（変更不可）。

### Line Count Check (`lineCount`)
**デフォルト: 有効**  
ソースファイルと翻訳ファイルの総行数とセクション位置が一致していることを確認します。`--skip-line-count-check`でスキップすると、行数とセクション位置の両方のチェックが無効になります。

## Tips

- **小さく始める**: デフォルトのチェックだけから始めて、徐々により厳格な要求を追加
- **Gitフックと連携**: Huskyと統合してコミット前に問題をキャッチ
- **CI統合**: CIパイプラインに追加してPRが翻訳を壊さないようにする
- **見出しルール**: `--require-original-section-titles`を使用して見出しを元の言語のまま保持

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
