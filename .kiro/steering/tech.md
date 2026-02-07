# 技術スタック

## 開発環境
- **OS**: macOS（推奨）
- **Shell**: Bash

## 依存ツール
- **sips**: macOS標準のコマンドラインツール（アイコン生成用）
- **ImageMagick**: 画像処理ライブラリ（`brew install imagemagick`）
- **zip**: アーカイブ作成（標準搭載）

## ビルドシステム
シェルスクリプトベースの軽量ビルドシステム

### 主要コマンド
```bash
# アイコン生成（16px, 19px, 32px, 38px, 48px, 128px）
./script/generate-icons.sh source-icon.png

# Chrome Web Store用ZIPパッケージ作成
./script/build-chrome-extension.sh

# スクリーンショット画像を1280x800にリサイズ
./script/resize-to-1280x800.sh screenshot.png
```

## Chrome拡張機能の構成
- `manifest.json`: 拡張機能の設定ファイル
- `content-script.js`: コンテンツスクリプト
- `styles.css`: スタイルシート
- `icons/`: アイコンファイル群
- `lib/`: ライブラリファイル（オプション）

## パッケージング
- Chrome Web Store用のZIPファイルを自動生成
- 不要ファイル（.DS_Store, .gitkeep等）を自動除外
- バージョン情報をmanifest.jsonから自動取得