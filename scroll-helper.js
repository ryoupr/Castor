// メインワールドで実行 - スクロール用
window.addEventListener('castor-scroll-bottom', () => {
  try {
    const msgs = document.querySelectorAll('model-response, user-query');
    const last = msgs[msgs.length - 1];
    if (last?.isConnected) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  } catch (_) {}
});
