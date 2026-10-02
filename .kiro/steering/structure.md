# プロジェクト構造

## ディレクトリ構成

```
.
├── README.md                    # プロジェクト概要
├── .gitignore                   # Git除外設定
├── package.json                 # 拡張機能名・バージョン・npmスクリプト
├── wxt.config.ts                # WXT設定（manifest の name / permissions 等）
├── tsconfig.json                # .wxt/tsconfig.json を継承
├── entrypoints/                 # エントリーポイント（manifest に自動反映）
│   └── content/
│       ├── index.ts             # コンテンツスクリプト
│       └── style.css            # コンテンツスクリプト用スタイル
├── public/                      # そのまま出力にコピーされる静的ファイル
│   └── icon/                    # アイコン（{16,32,48,128}.png を自動検出）
├── screenshot/                  # スクリーンショット格納
└── script/                      # アセット用スクリプト
    ├── generate-icons.sh
    └── resize-to-1280x800.sh
```

### 生成物（Git管理外）
- `.wxt/` - `wxt prepare` が生成する型定義・tsconfig
- `.output/chrome-mv3/` - ビルド結果（`chrome://extensions/` で読み込むディレクトリ）
- `node_modules/`

## ファイル命名規則

### エントリーポイント
- `entrypoints/content/index.ts` または `entrypoints/content.ts` - コンテンツスクリプト
- `entrypoints/<name>.content.ts` - 複数のコンテンツスクリプト
- `entrypoints/background.ts` - Service Worker
- `entrypoints/popup/index.html` / `options/index.html` / `sidepanel/index.html` - 各UI
- 詳細: https://wxt.dev/guide/essentials/entrypoints.html

### アイコンファイル
- `public/icon/16.png` - ファビコン・ツールバー用（16x16px）
- `public/icon/32.png` - Windows表示用（32x32px）
- `public/icon/48.png` - 拡張機能管理ページ用（48x48px）
- `public/icon/128.png` - Chrome Web Store用（128x128px）

### 出力ファイル
- `.output/{package.jsonのname}-{version}-chrome.zip` - Chrome Web Store用パッケージ
- `{ファイル名}_1280x800.png` - リサイズ済みスクリーンショット

## 注意事項
- 開発ワークフローの詳細は `workflow.md` を参照
- `manifest.json` は直接置かない（WXT が生成する）
- アセット用スクリプトはmacOS環境での実行を前提
