# CLAUDE.md - Chrome拡張機能開発テンプレート

Chrome拡張機能の開発テンプレート。ユーザーが要件を伝えたら、実装からビルドまで自律的に完了させる。

## 開発フロー・コード規約
**必ず `.kiro/steering/workflow.md` を読んでから作業を開始すること。**

## ビルドスクリプト
- `./script/generate-icons.sh <画像>` - アイコン一括生成
- `./script/build-chrome-extension.sh` - Chrome Web Store用ZIP作成
- `./script/resize-to-1280x800.sh <画像>` - スクリーンショットリサイズ

## ファイル構成
`.kiro/steering/structure.md` を参照。
