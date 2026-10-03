# Castor - Gemini UI Enhancer

Google Gemini (gemini.google.com) の UI/UX を改善する Chrome 拡張機能です。[WXT](https://wxt.dev/) ベースのテンプレート [develop-chrome-extension](https://github.com/ryoupr/develop-chrome-extension) から作成しています。

## 機能

- **チャット横幅調整** — ポップアップから %/px で設定可能（デフォルト: 90%）
- **最下部スクロールボタン** — ワンクリックでチャット最下部へ移動
- **Enter=改行 / Ctrl+Enter=送信** — 誤送信を防止、複数行入力が快適に
- **Ctrl+C=生成停止** — テキスト未選択時に生成を即停止（選択時は通常のコピー）
- **多言語対応** — 英語 / 日本語 / 中国語（簡体）/ スペイン語 / ヒンディー語 / アラビア語 / ポルトガル語（ブラジル）/ ロシア語 / ベンガル語。ブラウザの UI 言語に自動で追従（未対応言語は英語）

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
- 最下部から離れているときに右下に出る ↓ ボタンで、最下部へスクロール
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
│   └── popup/
│       ├── index.html                # 設定画面
│       └── main.ts
├── utils/settings.ts                 # 設定（横幅）の型・既定値・読み込み（popup と content script で共有）
├── utils/gemini-dom.ts               # Gemini の DOM に依存するセレクタ
├── public/
│   ├── icon/                         # アイコン（16/48/128px）
│   └── _locales/                     # 多言語メッセージ（<locale>/messages.json）
└── script/                           # アセット用スクリプト
```

`manifest.json` は WXT がビルド時に生成します。

## 技術メモ

- チャット履歴のスクロールコンテナは `infinite-scroller.chat-history`（`infinite-scroller` はほかにもあるが、スクロールするのはこれだけ）。最下部への移動は `scrollTo` で行い、↓ ボタンは最下部から 200px 以上離れているときだけ表示する。最後のメッセージの下には余白があるため、メッセージへの `scrollIntoView` では最下部まで届かない
- スクロール処理は content script（isolated world）から直接行う。isolated world でも DOM はページと共有される（参考: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#isolated_world ）
- Enter キー制御は `stopImmediatePropagation` で Zone.js/Angular のイベントを阻止
- IME 変換中は `e.isComposing` で Enter 処理をスキップ
- 横幅設定は `chrome.storage.local` に単位ごとの別キー（`widthUnit` / `maxWidthPercent` / `maxWidthPx`）で保存する。v1.1.0 までの `maxWidth` は、ポップアップを開いたときに新キーへ移行する（移行前でも読み込み時に旧キーを解釈するので表示は変わらない）
- 多言語対応は Chrome 標準の `i18n` API + `public/_locales/`（`default_locale: en`）。文言を追加するときは全ロケールの `messages.json` に同じキーを追加する（参考: https://wxt.dev/guide/essentials/i18n.html ）
- 英語・日本語以外の翻訳は機械的に作成したもので、ネイティブチェックは未実施
- Ctrl+Enter / Ctrl+C の送信・停止ボタンは、入力欄（`input-area-v2`）の中だけを class（`.send-button` / `.stop`）で探し、内側の `button` をクリックする。`aria-label` は UI 言語で変わり、サイドバーのチャット履歴のタイトルにも一致するため使わない。Gemini の DOM に依存するセレクタは `utils/gemini-dom.ts` にまとめている

## ライセンス

MIT License
