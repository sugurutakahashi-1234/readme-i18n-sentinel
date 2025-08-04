# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 一般的な開発ガイドライン

### 日本語と英語の使い分け
- ユーザーとのやり取り（説明、質問への回答など）: 日本語
- Claude Code 上での分析結果、計画、進捗報告: 日本語
- プランモードでの計画案: 日本語
- エラーメッセージの説明、デバッグ情報: 日本語
- TodoWriteツールのチェックリスト項目: 日本語
- コードのコメント: 英語
- コミットメッセージ: 英語
- PRタイトル・本文: 英語
- ドキュメント（README等）: 英語

### READMEの多言語対応ルール
- **見出しはすべて英語で統一**: すべての言語版のREADME（README.md、README.[言語コード].md）で、セクション見出し（##で始まる部分）は英語表記とする
- **目的**: URLのアンカーリンク（#installation など）を言語間で統一し、リンクの互換性を保つ
- **例**:
  - ✅ `## Installation` （すべての言語版で統一）
  - ❌ `## [その言語での翻訳]` （翻訳版でも使わない）

### コードの品質
- **型安全性**: TypeScriptの型安全を最優先
- **コードの可読性**: コメントやドキュメントを充実させる
- **テストの充実**: ユニットテスト、統合テストを必ず実装
- **エラー修正時のコメント**: エラーが発生した箇所や修正が必要だった箇所には、なぜそのエラーが起きたのか、どう修正したのかを説明するコメントを積極的に残す

### 実装方針
- **仕様の確認**: 実装前に必ずREADMEを熟読し、プロジェクトの仕様を理解する
- **YAGNI原則**: "You Aren't Gonna Need It" - 将来使うかもしれない機能や関数は作らない
- **未使用コードの防止**: 実際に使用されるコードのみを実装し、未使用の関数やクラスは作成しない
- **リファクタリング**: 綺麗なアーキテクチャを採用し、不要なコードは積極的に削除
- **CI実行**: 実装後は必ず `bun run ci` でコード品質を確認する
- **後方互換性を持たせない**: 利用者が少ない今のうちに、破壊的変更を積極的に許容し、後方互換性を一切持たせない
  - APIの変更、関数名の変更、ディレクトリ構造の変更などを躊躇なく実施
  - 古いコードとの互換性維持のための冗長なコードは作らない
- **積極的なリファクタリング**: 綺麗なアーキテクチャを追求し、継続的にコードを改善
  - 不要なコード、重複したコード、複雑すぎるコードは即座に削除・簡潔化
  - より良い設計パターンが見つかれば、既存の実装を躊躇なく置き換える
- **ライブラリの最新版使用**: 新しいライブラリをインストールする際は、必ず最新版を使用する
  - npm/yarn/bun でパッケージをインストールする際は、バージョンを指定せずに最新版をインストール
  - 例: `bun add package-name` （`@version` を付けない）
  - セキュリティとパフォーマンスの観点から、常に最新の安定版を使用することを推奨

### テストの方針
- **カバレッジより意味のあるテスト**: カバレッジ率を追求するのではなく、本当に価値のあるテストのみを実装
  - 100%カバレッジは目標ではない
  - 無意味なテスト（getter/setterのテスト、定数のテストなど）は書かない
  - 重要な振る舞いと境界値に焦点を当てる
- **テストランナー**: テストコードはbunで動作するように実装する（`bun test`コマンドで実行）
- **統合テスト優先**: リファクタリングを頻繁に行うため、内部実装に依存しない統合テストを優先
- **ユニットテストの削減**: 統合テストでカバーされている機能のユニットテストは積極的に削除
- **無駄なテストの例**:
  - 単純なgetter/setterのテスト
  - 型定義や定数の値を確認するだけのテスト
  - フレームワークの機能を再テストするようなテスト
  - 実装の詳細に依存しすぎているテスト
- **テスト失敗時の対応**: テストが失敗した場合、まずそのテスト自体の価値を検討する
  - そのテストは本当に必要か？
  - 統合テストでカバーできないか？
  - テストの削除も重要な選択肢として検討する
- **内部実装への依存を避ける**: 
  - 内部実装の詳細をテストしない（プライベートメソッド、内部状態など）
  - リファクタリング時に修正が必要なテストは作らない
  - 振る舞い（入力と出力）のみをテストする
- **モックの使用を避ける**: 可能な限り実際の実装を使用し、環境差異を生まないテストを書く
  - 外部API呼び出しなど、真にモックが必要な場合のみ使用
  - ユーティリティ関数（logger等）は実際の実装を使用し、オプション（quiet等）で制御
- **エッジケースに集中**: ユニットテストは統合テストでカバーしにくいエラーケースやエッジケースのみ
- **環境依存テストの削除**: パーミッションエラーなど環境に依存するテストは避ける
- **実装の見直し**: テストが複雑になる場合は、まず実装をシンプルにできないか検討する

### TypeScript実装前の型安全確認
- **必ず最初に**: tsconfig.json の型安全制御設定を確認
- **型安全性は最高レベル**: `strict: true`により`noImplicitAny`を含むすべての厳格な型チェックが有効
- **よくある間違い**: エクスポートする関数・クラスの戻り値型や引数型の明示的な型注釈を忘れがち

### Git操作の制限
- **コミット禁止**: ユーザーから明示的に指示された場合のみコミットを実行する
- **プッシュ禁止**: ユーザーから明示的に指示された場合のみプッシュを実行する
- **ブランチ操作制限**: ブランチの作成・切り替え・削除もユーザーの明示的な指示が必要
- **自動コミットの防止**: 変更を加えた後も、ユーザーの指示がない限りコミットしない

## プロジェクト固有の設定

### CIスクリプトの実行
- **CIコマンド**: `bun run ci` でフォーマット→型チェック→リント→ビルド→テスト→未使用コード検出を順次実行
- **エラー処理**: 途中でエラーが発生した場合は詳細を日本語で説明し、修正提案を行う
- **未使用コード検出**: CIで未使用の関数やクラスが検出されるため、実際に使用されるコードのみを実装すること

### Requirements
- **Node.js**: v20 以上
- **bun**: 最新版

readme‑i18n‑sentinel 企画書（改訂版）
目的: README を中心とした「多言語ドリフト（原文変更に対して翻訳が追随していない状態）」を、ローカルで素早く検知し、開発フローに自然に組み込める軽量 CLI を提供する。

1. プロダクト定義
* 製品名: readme‑i18n‑sentinel（以下、Sentinel）
* 形態: npm 配布の ローカル専用 CLI（husky, lint-staged 等のフックから呼び出す前提）
* 対象: Markdown ベースの README とその翻訳版（任意で他の .md ファイルにも適用可能）
* 非目標: 翻訳そのものの生成/編集、GitHub Actions 専用実装、TMS（Crowdin 等）との直接連携、PR コメント機能

2. ゴール / 非ゴール
ゴール
1. 原文（例: docs/README.md）の変更に対して、翻訳ファイル群（例: README.ja.md, README.zh-CN.md）が最新かどうかを即時判定
2. 行単位の厳密チェックを基本としつつ、必要な検査はコンフィグファイルでオン/オフ可能（モードは採用しない）
3. 設定は 単一のコンフィグ（TS/ESM または YAML/JSON） に集約。CLI での上書きは不可（-c/--config のみ）
4. 結果は 終了コード（0/1）と 人間可読なレポート、機械可読(JSON) の 3 形態で出力
5. husky の pre-commit / pre-push、ローカル手動実行にストレス無く組み込める
非ゴール
* 自動翻訳、誤訳検出、テキスト意味解析
* GitHub 専用機能（Actions のラッパー、PR コメント投稿など）
* Markdown 以外（JSON/PO 等）の専用サポート（将来の拡張候補には残す）

3. 主要ユースケース
1. コミット直前に原文だけ変更 → 翻訳未追随を検出してコミットをブロック
2. 翻訳だけの修正コミット → チェックを自動スキップ（原文が未変更のため）
3. 一部言語だけ先に更新 → 未更新の言語をリストアップして通知
4. 緊急対応で一時スキップ → husky の commit-msg で特別キーワードを検知し、Sentinel の実行をスキップ（CLI 側のスキップ機能は持たない）
5. 定期点検 → 手動実行で全翻訳の整合性レポートを取得

4. 検査の設計（固定ルール／CLIでの切替なし）
シンプルさを優先し、モードや切替フラグは無し。常に同じ検査セットを実行します。
常時有効な検査セット
1. lines: 原文と各翻訳の 総行数一致 を確認。
2. changes: git diff --unified=0 で抽出した 変更行番号 が、翻訳側でも 同じ行で更新 されているか確認。
3. headingsMatchSource: 見出し（#, ##, ...）の レベルとテキストの完全一致 を要求。多言語であっても見出しは 原文（例: 英語）を共通化。
比較の事前正規化（内部で自動・設定不要）
* 空白・改行などの一般的な正規化のみを内部実装で自動適用
※ 正規化は「誤検知を減らすための恒久ルール」として実装し、v1 では設定から変更できません（設定の最小化）。

5. CLI 仕様（極小インターフェース）
* 既定コマンド（サブコマンドなし）: readme-i18n-sentinel ・・・ 検査を実行（終了コード 0/1/2）
    * オプション: -c, --config <path>（設定ファイルを明示）
* 補助サブコマンド:
    * init …… 最小構成の設定ファイルを生成
    * validate …… 設定ファイルのスキーマ検証のみを行い、問題があれば詳細を表示（終了コード 2）
方針: フラグは -c/--config のみ。他の切替は すべてコンフィグ側 で定義する。原文変更の検知やスキップ制御は husky 側 に任せる。

6. 設定ファイル（できるだけシンプル）
# readme-i18n-sentinel.config.(yml|yaml|json|ts|mjs|mts)
# ESM/TS は `export default { ... }` を前提
source: docs/README.md
targets:
  - docs/README.ja.md
  - docs/README.zh-CN.md
checks:               # v1 では既定すべて true。必要なら false にできる
  lines: true
  changes: true
  headingsMatchSource: true
output:
  json: false         # true で CLI 出力を JSON（stdout）に固定
* 意味
    * source: 原文 README のパス
    * targets: 翻訳ファイルのパス配列（順序不問）
    * checks: 3 つの検査の ON/OFF（CLI からは変更不可）
    * output.json: 出力形式（JSON/Text）
* 設定の発見ルール: カレントから readme-i18n-sentinel.config.(yml|yaml|json|ts|mjs|mts) を探索。見つからない場合は package.json > readmeI18nSentinel を参照。-c 指定があればそれを優先。
* バリデーション: Zod による実行時検証 で厳格検証（必須/型/配列長≥1/未知キー禁止）。
---yaml
readme-i18n-sentinel.config.(yml|yaml|json|ts|mjs|mts)
ESM/TS は export default { ... } を前提
source: docs/README.mdtargets:
* docs/README.ja.md
* docs/README.zh-CN.mdjson: false # true にすると CLI 出力を JSON（stdout）に固定
- **意味**
  - `source`: 原文 README のパス
  - `targets`: 翻訳ファイルのパス配列（順序不問）
  - `json`: 出力形式。`true` なら JSON、`false` ならテキスト（既定: `false`）

- **設定の発見ルール**: カレントから `readme-i18n-sentinel.config.(yml|yaml|json|ts|mjs|mts)` を探索。見つからない場合は `package.json > readmeI18nSentinel` を参照。`-c` 指定があればそれを優先。
- **バリデーション**: **Zod による実行時検証** で厳格検証（必須/型/配列長≥1/未知キー禁止）。

---

## 7. 入出力仕様
### 入力
- Git リポジトリであること（`git diff` を使用）
- `source` と `targets`（設定から取得）

### 出力
- **終了コード**: 0=OK / 1=Outdated / 2=設定エラー
- **形式**: `json: false` の場合は **テキスト**（人が読むログを stderr）、`json: true` の場合は **JSON** を stdout にのみ出力
- **テキスト例**
  - `❌ ja.md: 42 行目が未反映`
  - `❌ zh-CN.md: 総行数不一致 (120 ≠ 118)`
  - `❌ ja.md: 見出し不一致 => "## Getting Started"`
  - `✅ 全言語最新`
- **JSON 例**
```json
{
  "ok": false,
  "errors": [
    {"file":"docs/README.ja.md","type":"line-missing","line":42},
    {"file":"docs/README.zh-CN.md","type":"headings-mismatch","heading":"## Getting Started"}
  ]
}

8. スキップ & 実行設計（husky 前提）
* 原文変更の検知: pre-commit で git diff --cached --name-only | grep '^docs/README.md$' を条件に実行。
* スキップ: commit-msg フックでコミットメッセージに [i18n-skip] が含まれる場合は Sentinel を呼ばない（ツール本体にスキップ機能は持たせない）。
サンプル
# .husky/pre-commit
if git diff --cached --name-only | grep -q '^docs/README.md$'; then
  npx readme-i18n-sentinel -c ./readme-i18n-sentinel.config.yml || exit 1
fi

# .husky/commit-msg
MSG_FILE="$1"
if grep -q "\[i18n-skip\]" "$MSG_FILE"; then
  exit 0
fi
Sentinel は 実行時の切替フラグを持たず、挙動は常に一定。実行する/しないの判定は husky 側で完結。

9. 互換性・パフォーマンス・制約
* Node.js 18+、ESM 専用（type: module）。CJS はサポートしない
* 設定ファイルに TypeScript/ESM をサポート（.ts/.mts/.mjs は export default を前提）
* 1,000 行規模の README × 3 言語で 300ms 以内（ローカル SSD 想定）
* 行末・改行コード（LF/CRLF）は自動正規化
* Fenced code block 内は既定で対象外（将来設定で切替）

10. エラー設計
* 設定ファイルが無い/不正 → コード 2 + スキーマ差分を表示
* 原文/翻訳が見つからない → コード 1（運用上のエラーとして扱う）
* Git 操作に失敗 → コード 2（環境エラー）

11. セキュリティ / プライバシー
* ネットワークアクセス無し。ローカルファイルと Git 差分のみを扱う
* テレメトリ無し

12. 品質保証（最低限のテスト方針）
* ユニット: 行数一致、変更行抽出、見出し一致の 3 検査関数
* フィクスチャ: 正常／行ズレ／未反映／見出し不一致
* クロスプラットフォーム: macOS / Ubuntu / Windows（改行差）

13. ロードマップ
* v0.1: 固定検査（lines/changes/headingsMatchSource）+ 単一設定 + JSON 出力 + init/validate
* v0.2: 無視範囲コメント（<!-- sentinel:ignore start/end -->）+ 改行/空白の正規化強化
* v1.0: スキーマ安定化・性能最適化

14. 開発メモ（AI コーディング支援向け）
* 依存候補: cosmiconfig + cosmiconfig-typescript-loader（TS/ESM 設定読み込み）、ajv（JSON Schema バリデーション）、simple-git
* 実装順序: loader（ESM/TS 読込 + Ajv 検証）→ diff 抽出 → 判定（lines/changes/headings）→ レポータ → CLI → init/validate
* バリデーション選択: Zod（推奨）
    * 長所: TS-first の単一ソース。configSchema.parse(obj) だけで実行時検証／デフォルト付与（.default()）／追加制約（refine）が可能
    * IDE 連携: zod-to-json-schema で JSON Schema を生成し $schema に指定すれば YAML/JSON の補完も効く
    * 代替案: Ajv を使う場合は JSON Schema 起点で設計。もしくは Zod→JSON Schema 生成 → Ajv 実行のハイブリッド
* 最小インターフェース案:interface Config { source:string; targets:string[]; checks?:{lines?:boolean;changes?:boolean;headingsMatchSource?:boolean}; output?:{json?:boolean} }
* type ErrorType = 'lines-mismatch'|'line-missing'|'headings-mismatch';
* interface ErrorItem { file:string; type:ErrorType; line?:number; heading?:string }
* interface Result { ok:boolean; errors: ErrorItem[] }
* ```ts
* interface Config { source:string; targets:string[]; checks?:{lines?:boolean;changes?:boolean;headingsMatchSource?:boolean}; output?:{json?:boolean} }
* type ErrorType = 'lines-mismatch'|'line-missing'|'headings-mismatch';
* interface ErrorItem { file:string; type:ErrorType; line?:number; heading?:string }
* interface Result { ok:boolean; errors: ErrorItem[] }
* 
備考: GitHub Actions は対象外。ローカル体験に集中し、将来必要なら同 CLI を CI から呼ぶだけで済む設計。
