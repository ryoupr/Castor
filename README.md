# Castor - Gemini UI Enhancer

Google Gemini (gemini.google.com) の UI/UX を改善する Chrome 拡張機能です。[WXT](https://wxt.dev/) ベースのテンプレート [develop-chrome-extension](https://github.com/ryoupr/develop-chrome-extension) から作成しています。

## 機能

- **チャット横幅調整** — ポップアップから %/px で設定可能（デフォルト: 90%）
- **最下部スクロールボタン** — ワンクリックでチャット最下部へ移動
- **Enter=改行 / Ctrl+Enter=送信** — 誤送信を防止、複数行入力が快適に
- **Ctrl+C=生成停止** — テキスト未選択時に生成を即停止（選択時は通常のコピー）

## 必要な環境

- Node.js 22 以上

## インストール

```bash
git clone https://github.com/ryoupr/Castor.git
cd Castor
npm install
npm run build
```

1. Chrome で `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」で `.output/chrome-mv3/` を選択

## 開発

| コマンド | 内容 |
|---|---|
| `npm run dev` | 拡張機能を読み込んだ Chrome を起動し、変更をホットリロード |
| `npm run build` | `.output/chrome-mv3/` に本番ビルド |
| `npm run zip` | Chrome Web Store 用ZIPを `.output/` に作成 |
| `npm run compile` | TypeScript の型チェック |
| `./script/generate-icons.sh <画像>` | アイコン一括生成（`public/icon/`） |
| `./script/resize-to-1280x800.sh <画像>` | スクリーンショットを 1280x800 にリサイズ |

## 使い方

- ツールバーの Castor アイコンをクリックして横幅を設定
- チャット画面右下の ↓ ボタンで最下部へスクロール
- Enter で改行、Ctrl+Enter で送信
- 生成中に Ctrl+C で停止

## ファイル構成

```
├── package.json                      # name / version / description（manifest に反映）
├── wxt.config.ts                     # manifest 設定（name / permissions / action）
├── entrypoints/
│   ├── content/
│   │   ├── index.ts                  # メインロジック（isolated world）
│   │   └── style.css                 # UI スタイル
│   ├── scroll-helper.content.ts      # スクロール処理（main world）
│   └── popup/
│       ├── index.html                # 設定画面
│       └── main.ts
├── public/icon/                      # アイコン（16/48/128px）
└── script/                           # アセット用スクリプト
```

`manifest.json` は WXT がビルド時に生成します。

## 技術メモ

- Gemini は `infinite-scroller` + 仮想スクロールを使用。`scrollIntoView` で最下部移動を実現
- Enter キー制御は `stopImmediatePropagation` で Zone.js/Angular のイベントを阻止
- IME 変換中は `e.isComposing` で Enter 処理をスキップ
- スクロール処理は CSP 制約のため `world: 'MAIN'` の別コンテンツスクリプトとして実行（MAIN world では拡張機能 API は使えない。参考: https://wxt.dev/guide/essentials/content-scripts.html ）

## ライセンス

MIT License
