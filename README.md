# Castor - Gemini UI Enhancer

Google Gemini (gemini.google.com) の UI/UX を改善する Chrome 拡張機能です。

## 機能

- **チャット横幅調整** — ポップアップから %/px で設定可能（デフォルト: 90%）
- **最下部スクロールボタン** — ワンクリックでチャット最下部へ移動
- **Enter=改行 / Ctrl+Enter=送信** — 誤送信を防止、複数行入力が快適に
- **Ctrl+C=生成停止** — テキスト未選択時に生成を即停止（選択時は通常のコピー）
- **多言語対応** — 英語 / 日本語 / 中国語（簡体）/ スペイン語 / ヒンディー語 / アラビア語 / ポルトガル語（ブラジル）/ ロシア語 / ベンガル語。ブラウザの UI 言語に自動で追従（未対応言語は英語）

## インストール

1. このリポジトリをクローン
2. Chrome で `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」でプロジェクトフォルダを選択

## 使い方

- ツールバーの Castor アイコンをクリックして横幅を設定
- チャット画面右下の ↓ ボタンで最下部へスクロール
- Enter で改行、Ctrl+Enter で送信
- 生成中に Ctrl+C で停止

## ファイル構成

```
├── manifest.json        # 拡張機能設定
├── content-script.js    # メインロジック（isolated world）
├── scroll-helper.js     # スクロール処理（main world）
├── styles.css           # UI スタイル
├── popup.html / popup.js # 設定画面
├── _locales/            # 多言語メッセージ（<locale>/messages.json）
└── icons/               # アイコン（16/48/128px）
```

## 技術メモ

- Gemini は `infinite-scroller` + 仮想スクロールを使用。`scrollIntoView` で最下部移動を実現
- Enter キー制御は `stopImmediatePropagation` で Zone.js/Angular のイベントを阻止
- IME 変換中は `e.isComposing` で Enter 処理をスキップ
- スクロール処理は CSP 制約のため `"world": "MAIN"` で別スクリプトとして実行
- 多言語対応は Chrome 標準の `chrome.i18n` + `_locales/`（`default_locale: en`）。文言を追加するときは全ロケールの `messages.json` に同じキーを追加する
- 英語・日本語以外の翻訳は機械的に作成したもので、ネイティブチェックは未実施
- Ctrl+Enter / Ctrl+C の送信・停止ボタン検出は class セレクタが主で、`aria-label` によるフォールバックは Gemini が日本語・英語表示のときのみ有効

## ライセンス

MIT License
