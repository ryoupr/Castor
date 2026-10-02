# プロジェクト構造

## ディレクトリ構成

```
.
├── README.md                    # プロジェクト概要
├── .gitignore                   # Git除外設定
├── manifest.json                # Chrome拡張機能設定
├── content-script.js            # コンテンツスクリプト
├── styles.css                   # スタイルシート
├── _locales/                    # 多言語メッセージ（<locale>/messages.json、オプション）
├── icons/                       # アイコンファイル格納
├── screenshot/                  # スクリーンショット格納
├── lib/                         # ライブラリファイル（オプション）
└── script/                      # ビルドスクリプト
    ├── build-chrome-extension.sh
    ├── generate-icons.sh
    └── resize-to-1280x800.sh
```

## ファイル命名規則

### アイコンファイル
- `icons/icon16.png` - ファビコン用（16x16px）
- `icons/icon19.png` - ツールバー用（19x19px）
- `icons/icon32.png` - Windows表示用（32x32px）
- `icons/icon38.png` - ツールバー高解像度用（38x38px）
- `icons/icon48.png` - 拡張機能管理ページ用（48x48px）
- `icons/icon128.png` - Chrome Web Store用（128x128px）

### 出力ファイル
- `{拡張機能名}-v{バージョン}.zip` - Chrome Web Store用パッケージ
- `{ファイル名}_1280x800.png` - リサイズ済みスクリーンショット

## 注意事項
- 開発ワークフローの詳細は `workflow.md` を参照
- スクリプトはmacOS環境での実行を前提
- 一時ファイルは自動削除される
- .gitkeepファイルは自動的にパッケージから除外
