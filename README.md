# Chrome拡張機能開発ツールキット

Chrome拡張機能の開発を効率化するためのテンプレート・ツールキットです。アイコン生成からパッケージングまで、開発からリリースまでの一貫したワークフローを提供します。

## 📦 このテンプレートの使い方

1. 画面右上の **「Use this template」** → **「Create a new repository」** をクリック
2. リポジトリ名と公開設定を入力して作成
3. 作成されたリポジトリをクローンして開発開始

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

4. 以下を編集して開発開始:
   - [ ] `manifest.json` の `name`, `description` を変更
   - [ ] `manifest.json` の `matches` を対象URLに変更
   - [ ] `manifest.json` の `permissions` を必要に応じて追加
   - [ ] `content-script.js` にメインロジックを実装
   - [ ] `styles.css` にスタイルを実装

## 🚀 主な機能

- **アイコン自動生成**: 1つの画像から複数サイズのアイコンを自動生成
- **パッケージング自動化**: Chrome Web Store用のZIPファイルを自動作成
- **画像リサイズツール**: スクリーンショット用画像の自動調整
- **日本語ドキュメント**: 完全日本語対応のドキュメントとツール

## 📋 必要な環境

### 必須
- **macOS** (推奨)
- **Bash** シェル

### 依存ツール
- **sips**: macOS標準のコマンドラインツール (アイコン生成用)
- **ImageMagick**: 画像処理ライブラリ
- **zip**: アーカイブ作成 (標準搭載)

### ImageMagickのインストール
```bash
# Homebrewを使用
brew install imagemagick
```

## 🛠️ 使用方法

### 1. アイコン生成

1つの画像から Chrome拡張機能に必要な全サイズのアイコンを自動生成します。

```bash
# 基本的な使用方法
./script/generate-icons.sh source-icon.png

# 使用例
./script/generate-icons.sh my-extension-icon.png
```

**生成されるアイコン:**
- `icons/icon16.png` (16x16px) - 拡張機能のファビコン
- `icons/icon19.png` (19x19px) - ツールバーアイコン（旧版対応）
- `icons/icon32.png` (32x32px) - Windows等での表示
- `icons/icon38.png` (38x38px) - ツールバーアイコン（高解像度）
- `icons/icon48.png` (48x48px) - 拡張機能管理ページ
- `icons/icon128.png` (128x128px) - Chrome Web Store表示

**推奨事項:**
- 正方形の画像を使用
- 128px以上の高解像度画像を推奨
- PNG形式で入力

### 2. Chrome Web Store用パッケージ作成

拡張機能をChrome Web Storeに公開するためのZIPファイルを作成します。

```bash
./script/build-chrome-extension.sh
```

**パッケージに含まれるファイル:**
- `manifest.json` (必須)
- `content-script.js` (必須)
- `styles.css` (必須)
- `icons/` ディレクトリ
- `lib/` ディレクトリ (存在する場合)

**自動除外されるファイル:**
- `.DS_Store`
- `.gitkeep`
- 隠しファイル

### 3. スクリーンショット画像のリサイズ

Chrome Web Store用のスクリーンショット画像を1280x800サイズに調整します。

```bash
# 単一ファイル
./script/resize-to-1280x800.sh screenshot.png

# 複数ファイル
./script/resize-to-1280x800.sh *.jpg *.png

# ディレクトリ内の全画像
./script/resize-to-1280x800.sh screenshot/

# 出力ディレクトリを指定
./script/resize-to-1280x800.sh -o output/ *.jpg

# 確認なしで上書き
./script/resize-to-1280x800.sh -y screenshot.png
```

**機能:**
- 縦横比を保持してリサイズ
- 透明背景でPNG出力
- 複数ファイルの一括処理
- ディレクトリ指定での自動検出

## 📁 プロジェクト構造

```
.
├── README.md                    # プロジェクト概要
├── .gitignore                   # Git除外設定
├── manifest.json                # Chrome拡張機能設定（編集して使用）
├── content-script.js            # コンテンツスクリプト（編集して使用）
├── styles.css                   # スタイルシート（編集して使用）
├── icons/                       # アイコンファイル格納
│   └── .gitkeep
├── screenshot/                  # スクリーンショット格納
│   └── .gitkeep
├── lib/                         # ライブラリファイル（オプション）
└── script/                      # ビルドスクリプト
    ├── build-chrome-extension.sh
    ├── generate-icons.sh
    └── resize-to-1280x800.sh
```

## 🔄 開発ワークフロー

### 1. 初期設定
```bash
# プロジェクトをクローン
git clone <repository-url>
cd develop-chrome-extension

# 必要な依存関係をインストール
brew install imagemagick
```

### 2. 拡張機能の開発
```bash
# 1. manifest.jsonを作成
# 2. content-script.js, styles.cssを実装
# 3. アイコンを生成
./script/generate-icons.sh your-icon.png
```

### 3. テストとデバッグ
```bash
# Chrome拡張機能として読み込んでテスト
# chrome://extensions/ で「デベロッパーモード」を有効にして読み込み
```

### 4. スクリーンショット準備
```bash
# スクリーンショットを撮影後、サイズ調整
./script/resize-to-1280x800.sh screenshot.png
```

### 5. パッケージング
```bash
# Chrome Web Store用ZIPファイルを作成
./script/build-chrome-extension.sh
```

### 6. 公開
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) にアクセス
- 生成されたZIPファイルをアップロード

## 🔧 トラブルシューティング

### よくある問題

**Q: `sips: command not found` エラーが出る**
A: macOS以外の環境では`sips`コマンドが利用できません。macOS環境で実行してください。

**Q: `convert: command not found` エラーが出る**
A: ImageMagickがインストールされていません。`brew install imagemagick`でインストールしてください。

**Q: アイコンが歪んで見える**
A: 元画像が正方形でない可能性があります。正方形の画像を使用してください。

**Q: ZIPファイル作成時に`manifest.json not found`エラー**
A: プロジェクトルートに`manifest.json`ファイルが必要です。Chrome拡張機能の設定ファイルを作成してください。

### ログの確認

各スクリプトは詳細なログを出力します：
- 🔵 `[INFO]`: 情報メッセージ
- 🟢 `[SUCCESS]`: 成功メッセージ  
- 🟡 `[WARNING]`: 警告メッセージ
- 🔴 `[ERROR]`: エラーメッセージ

## 📝 manifest.json の例

```json
{
  "manifest_version": 3,
  "name": "Your Extension Name",
  "version": "1.0.0",
  "description": "Your extension description",
  "icons": {
    "16": "icons/icon16.png",
    "19": "icons/icon19.png",
    "32": "icons/icon32.png",
    "38": "icons/icon38.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["https://example.com/*"],
      "js": ["content-script.js"],
      "css": ["styles.css"]
    }
  ]
}
```

## 🤝 貢献

プルリクエストや Issue の報告を歓迎します。

## 📄 ライセンス

MIT License