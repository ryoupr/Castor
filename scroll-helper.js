// メインワールドで実行 - スクロール用
window.addEventListener('castor-scroll-bottom', () => {
  // 最後のメッセージ要素にscrollIntoView
  const msgs = document.querySelectorAll('model-response, user-query');
  const last = msgs[msgs.length - 1];
  if (last) {
    last.scrollIntoView({ behavior: 'smooth', block: 'end' });
    console.log('castor: scrollIntoView on', last.tagName);
  } else {
    console.log('castor: no messages found');
  }
});
