// メインワールドで実行 - スクロール用（Gemini の仮想スクロールに対応するため）
// MAIN world では拡張機能 API は使えない: https://wxt.dev/guide/essentials/content-scripts.html
export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  runAt: 'document_end',
  world: 'MAIN',
  main() {
    window.addEventListener('castor-scroll-bottom', () => {
      try {
        const msgs = document.querySelectorAll('model-response, user-query');
        const last = msgs[msgs.length - 1];
        if (last?.isConnected) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch {
        // DOM 構造の変化などで失敗しても無視する
      }
    });
  },
});
