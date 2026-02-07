# Castor - Gemini UI Enhancer

Google Gemini (gemini.google.com) の UI/UX を改善する Chrome 拡張機能です。

## 機能

- **チャット横幅調整** — ポップアップから %/px で設定可能（デフォルト: 90%）
- **最下部スクロールボタン** — ワンクリックでチャット最下部へ移動
- **Enter=改行 / Ctrl+Enter=送信** — 誤送信を防止、複数行入力が快適に
- **Ctrl+C=生成停止** — テキスト未選択時に生成を即停止（選択時は通常のコピー）

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
└── icons/               # アイコン（16/48/128px）
```

## 技術メモ

- Gemini は `infinite-scroller` + 仮想スクロールを使用。`scrollIntoView` で最下部移動を実現
- Enter キー制御は `stopImmediatePropagation` で Zone.js/Angular のイベントを阻止
- IME 変換中は `e.isComposing` で Enter 処理をスキップ
- スクロール処理は CSP 制約のため `"world": "MAIN"` で別スクリプトとして実行

## ライセンス

MIT License
