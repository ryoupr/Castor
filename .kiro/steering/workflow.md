# Chrome拡張機能 開発ワークフロー

## テンプレートリポジトリ
- https://github.com/ryoupr/develop-chrome-extension
- 新しい拡張機能を作る際は「Use this template」から新リポジトリを作成する

## 開発フロー

### Phase 1: プロジェクト作成
1. GitHubで「Use this template」→ 新リポジトリ作成（命名: 拡張機能の機能を表す名前）
2. `git clone` してローカルに取得
3. `manifest.json` を編集:
   - `name`: 拡張機能名
   - `description`: 説明文
   - `matches`: 対象URL（デフォルト: `https://example.com/*`。対象ドメインに変更すること）
   - `permissions`: 必要な権限

### Phase 2: 実装
1. `content-script.js` にメインロジックを実装
2. `styles.css` にスタイルを実装
3. 外部ライブラリが必要な場合は `lib/` に配置し、`manifest.json` の `js` 配列に追加
4. Chrome で動作確認: `chrome://extensions/` → デベロッパーモード → 「パッケージ化されていない拡張機能を読み込む」

### Phase 3: アセット準備
```bash
# アイコン生成（128px以上の正方形PNG画像を用意）
./script/generate-icons.sh source-icon.png

# スクリーンショット撮影後、Chrome Web Store用にリサイズ
./script/resize-to-1280x800.sh screenshot/*.png
```

### Phase 4: ビルド & 公開
```bash
# Chrome Web Store用ZIPを作成
./script/build-chrome-extension.sh
```
- 生成された `{name}-v{version}.zip` を Chrome Web Store Developer Dashboard にアップロード
- URL: https://chrome.google.com/webstore/devconsole/

### Phase 5: バージョンアップ
1. `manifest.json` の `version` をインクリメント
2. 変更を実装・テスト
3. `./script/build-chrome-extension.sh` で再ビルド
4. Developer Dashboard で新バージョンをアップロード

## Agent向け指示

### 新規拡張機能の開発を依頼された場合
ユーザーが拡張機能の要件を伝えたら、以下を**確認を挟まず自律的に完了**まで進めること。

1. `manifest.json` を要件に合わせて編集（`name`, `description`, `version`, `matches`, `permissions`）
2. `content-script.js` を実装（要件のメインロジック）
3. `styles.css` を実装（必要なスタイル）
4. 外部ライブラリが必要な場合は `lib/` に配置し、`manifest.json` に追加
5. 実装完了後、`chrome://extensions/` での動作確認手順をユーザーに提示
6. ユーザーがアイコン画像を提供したら `./script/generate-icons.sh` を実行
7. `./script/build-chrome-extension.sh` でZIPを作成

### 自律実行の判断基準
- **確認不要**: manifest.json編集、コード実装、スタイル実装 → そのまま進める
- **ユーザー待ち**: アイコン画像の提供、Chrome Web Storeへのアップロード → ユーザーに依頼。アイコンが未提供の場合は https://ryoupr.github.io/home/tools/icon-generator で簡易作成できることを案内する
- **確認必要**: 要件が曖昧で複数の解釈がある場合のみ → 最小限の質問で確認

### サブエージェントの活用
開発速度を最大化するため、独立したタスクは積極的にサブエージェントで並列実行すること。

**並列化の例:**
- `content-script.js` の実装と `styles.css` の実装を同時に進める
- `manifest.json` の設定と `README.md` の更新を同時に進める
- 複数ファイルのレビューを同時に実行する

**並列化してはいけない例:**
- `manifest.json` の内容に依存するコード実装（manifest確定後に実装）
- ビルドスクリプト実行（全ファイルが揃ってから）

### コード規約
- `content-script.js`: 即時実行関数で囲み、グローバル汚染を防ぐ
- DOM操作は `document.addEventListener('DOMContentLoaded', ...)` または `MutationObserver` を使用
- CSS クラス名にはプレフィックスを付けて既存サイトとの衝突を防ぐ（例: `myext-`）
