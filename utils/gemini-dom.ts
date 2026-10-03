// Gemini の DOM に依存するセレクタをまとめたモジュール。Gemini 側の変更で動かなくなったら、ここを直す。
// 2026-10-03 に gemini.google.com（日本語 UI）で確認した構造:
//   input-area-v2
//     div.send-button.submit > button[aria-label="プロンプトを送信"]  （入力があるとき。アイコンは arrow_upward）
//     div.send-button.stop   > button[aria-label="回答を停止"]        （生成中。アイコンは stop）
// aria-label は UI 言語で変わり、サイドバーのチャット履歴のタイトルにも一致しうるため使わない。
// 検索範囲は入力欄の中に限定する（ページ全体を探すと、履歴のリンクなどを誤ってクリックするため）。
//
// クリックするのは内側の button に揃える。button へのクリックは外側の div にもバブリングするので、
// クリック処理がどちらに付いていても動く。また、無効状態の button はクリックを発火しない。
//
// チャット履歴のスクロールコンテナ（2026-10-03 に確認）:
//   infinite-scroller.chat-history  （scrollTop・scrollHeight と scroll イベントが使える）
// infinite-scroller はほかにもあるが、スクロールするのは chat-history のものだけ。
// 最後のメッセージの下には余白があるため、メッセージへの scrollIntoView では最下部まで届かない。

const INPUT_AREA = 'input-area-v2';
const SEND_BUTTON = '.send-button:not(.stop) button';
const STOP_BUTTON = '.send-button.stop button';
// class が変わったときの予備（Material Symbols のアイコン名は UI 言語に依存しない）
const STOP_ICON = 'button mat-icon[fonticon="stop"]';

const CHAT_SCROLLER = 'infinite-scroller.chat-history';
// class が変わったときの予備（メッセージを含み、スクロールできる infinite-scroller を探す）
const ANY_SCROLLER = 'infinite-scroller';
const MESSAGE = 'model-response, user-query';

const inputArea = (): Element | null => document.querySelector(INPUT_AREA);

export const findChatScroller = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(CHAT_SCROLLER) ??
  [...document.querySelectorAll<HTMLElement>(ANY_SCROLLER)].find((el) => el.scrollHeight > el.clientHeight && !!el.querySelector(MESSAGE)) ??
  null;

export const findSendButton = (): HTMLButtonElement | null =>
  inputArea()?.querySelector<HTMLButtonElement>(SEND_BUTTON) ?? null;

export const findStopButton = (): HTMLButtonElement | null => {
  const area = inputArea();
  if (!area) return null;
  return (
    area.querySelector<HTMLButtonElement>(STOP_BUTTON) ??
    area.querySelector(STOP_ICON)?.closest<HTMLButtonElement>('button') ??
    null
  );
};
