# 技術スタック

## 開発環境
- **Node.js**: 22 以上
- **OS**: macOS（推奨。アセット用スクリプトが sips を使用）

## フレームワーク
- **[WXT](https://wxt.dev/)**: Vite ベースのブラウザ拡張機能フレームワーク
  - Manifest V3 の manifest.json をエントリーポイントと `wxt.config.ts` から自動生成
  - 開発時は拡張機能を読み込んだブラウザを起動し、ホットリロード（ブラウザ起動には devDependencies の `web-ext` を使用。未インストールだと手動読み込みになる: https://wxt.dev/guide/essentials/config/browser-startup.html ）
  - `defineContentScript` / `defineBackground` / `browser` などを自動 import
- **TypeScript**

## 依存ツール（アセット用）
- **sips**: macOS標準のコマンドラインツール（アイコン生成用）
- **ImageMagick**: 画像処理ライブラリ（`brew install imagemagick`）

## 主要コマンド
```bash
npm install          # 依存関係インストール（wxt prepare も実行される）
npm run dev          # 開発サーバー起動（Chrome自動起動・ホットリロード）
npm run build        # .output/chrome-mv3/ にビルド
npm run zip          # Chrome Web Store用ZIPを .output/ に作成
npm run compile      # 型チェック

# アイコン生成（16px, 32px, 48px, 128px → public/icon/）
./script/generate-icons.sh source-icon.png

# スクリーンショット画像を1280x800にリサイズ
./script/resize-to-1280x800.sh screenshot.png
```

## Chrome拡張機能の構成
- `wxt.config.ts`: manifest の設定（name, permissions 等）
- `package.json`: version / description（manifest に反映）
- `entrypoints/`: コンテンツスクリプト・background・popup 等
- `public/icon/`: アイコンファイル群
