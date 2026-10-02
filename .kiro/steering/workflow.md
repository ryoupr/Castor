# Chrome拡張機能 開発ワークフロー

## テンプレートリポジトリ
- https://github.com/ryoupr/develop-chrome-extension
- 新しい拡張機能を作る際は「Use this template」から新リポジトリを作成する
- フレームワーク: [WXT](https://wxt.dev/)（Vite ベース / TypeScript / Manifest V3）

## 開発フロー

### Phase 1: プロジェクト作成
1. GitHubで「Use this template」→ 新リポジトリ作成（命名: 拡張機能の機能を表す名前）
2. `git clone` してローカルに取得し、`npm install`（`postinstall` で `wxt prepare` が走り型定義が生成される）
3. 拡張機能の基本情報を編集:
   - `package.json`: `name`（ZIP名に使用。kebab-case）, `description`, `version`
   - `wxt.config.ts` の `manifest`: `name`（表示名）, `permissions`, `host_permissions` 等
   - `entrypoints/content/index.ts` の `matches`: 対象URL（デフォルト: `https://example.com/*`。対象ドメインに変更すること）

### Phase 2: 実装
1. `entrypoints/content/index.ts` の `main()` にメインロジックを実装
2. `entrypoints/content/style.css` にスタイルを実装
3. 外部ライブラリは `npm install <pkg>` で追加し、`import` して使う（バンドルされる）
4. 他のエントリーポイントが必要なら `entrypoints/` に追加する（manifest には自動反映）
   - `background.ts` / `popup/index.html` / `options/index.html` / `sidepanel/index.html` など
   - 詳細: https://wxt.dev/guide/essentials/entrypoints.html
5. 動作確認:
   - `npm run dev` → 拡張機能を読み込んだ Chrome が起動し、変更がホットリロードされる
   - ブラウザを自動起動できない環境では `npm run build` → `chrome://extensions/` → デベロッパーモード →「パッケージ化されていない拡張機能を読み込む」で `.output/chrome-mv3/` を選択
6. `npm run compile` で型チェック

### Phase 3: アセット準備
```bash
# アイコン生成（128px以上の正方形PNG画像を用意）→ public/icon/{16,32,48,128}.png
./script/generate-icons.sh source-icon.png

# スクリーンショット撮影後、Chrome Web Store用にリサイズ
./script/resize-to-1280x800.sh screenshot/*.png
```
- `public/icon/` のアイコンは WXT が自動検出して manifest の `icons` に設定する

### Phase 4: ビルド & 公開
```bash
# Chrome Web Store用ZIPを作成 → .output/{name}-{version}-chrome.zip
npm run zip
```
- 生成されたZIPを Chrome Web Store Developer Dashboard にアップロード
- URL: https://chrome.google.com/webstore/devconsole/

### Phase 5: バージョンアップ
1. `npm version patch`（または `minor` / `major`）で `package.json` の `version` をインクリメント
2. 変更を実装・テスト
3. `npm run zip` で再ビルド
4. Developer Dashboard で新バージョンをアップロード

## Agent向け指示

### 新規拡張機能の開発を依頼された場合
ユーザーが拡張機能の要件を伝えたら、以下を**確認を挟まず自律的に完了**まで進めること。

1. `npm install`（未実行の場合）
2. `package.json`（`name`, `description`, `version`）と `wxt.config.ts`（`manifest.name`, `permissions` 等）を要件に合わせて編集
3. `entrypoints/content/index.ts` を実装（`matches` と要件のメインロジック）
4. `entrypoints/content/style.css` を実装（必要なスタイル）
5. background / popup 等が必要なら `entrypoints/` に追加
6. 外部ライブラリが必要な場合は `npm install` で追加
7. `npm run compile` と `npm run build` が通ることを確認
8. 実装完了後、動作確認手順（`npm run dev`、または `.output/chrome-mv3/` の読み込み）をユーザーに提示
9. ユーザーがアイコン画像を提供したら `./script/generate-icons.sh` を実行
10. `npm run zip` でZIPを作成

### 自律実行の判断基準
- **確認不要**: package.json / wxt.config.ts 編集、コード実装、スタイル実装、npm パッケージ追加 → そのまま進める
- **ユーザー待ち**: アイコン画像の提供、Chrome Web Storeへのアップロード → ユーザーに依頼。アイコンが未提供の場合は https://ryoupr.github.io/home/tools/icon-generator で簡易作成できることを案内する
- **確認必要**: 要件が曖昧で複数の解釈がある場合のみ → 最小限の質問で確認

### サブエージェントの活用
開発速度を最大化するため、独立したタスクは積極的にサブエージェントで並列実行すること。

**並列化の例:**
- 独立したエントリーポイント（content / background / popup）の実装を同時に進める
- スクリプトの実装と `style.css` の実装を同時に進める
- 複数ファイルのレビューを同時に実行する

**並列化してはいけない例:**
- `wxt.config.ts` の permissions やエントリーポイント間のメッセージ仕様に依存する実装（仕様確定後に実装）
- `npm run build` / `npm run zip`（全ファイルが揃ってから）

### コード規約
- TypeScript で書き、`npm run compile` でエラーが出ない状態を保つ
- エントリーポイントは `defineContentScript` / `defineBackground` 等でラップする（WXT が自動 import するため import 不要）
- ブラウザ API は `chrome.*` ではなく `browser.*`（WXT 提供）を使う
- DOM操作は `MutationObserver` 等で遅延要素に対応する。content script の後始末が必要な処理は `main(ctx)` の `ctx`（`ctx.addEventListener`, `ctx.setInterval`, `ctx.onInvalidated`）を使う
- CSS クラス名にはプレフィックスを付けて既存サイトとの衝突を防ぐ（例: `myext-`）。強い分離が必要なら `createShadowRootUi` を使う
- `manifest.json` は直接作成しない（WXT が `wxt.config.ts` とエントリーポイントから生成する）
