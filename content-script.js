// Castor - Gemini UI Enhancer
(() => {
  // --- 横幅設定の適用 ---
  let cachedUnit = 'percent';
  let cachedWidth = 90;

  const applyMaxWidth = () => {
    const css = cachedUnit === 'percent' ? cachedWidth + '%' : cachedWidth + 'px';
    document.documentElement.style.setProperty('--castor-max-width', css);
  };

  chrome.storage.local.get(['maxWidth', 'widthUnit'], (data) => {
    cachedUnit = data.widthUnit || 'percent';
    cachedWidth = data.maxWidth || (cachedUnit === 'percent' ? 90 : 1200);
    applyMaxWidth();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.widthUnit) cachedUnit = changes.widthUnit.newValue || 'percent';
    if (changes.maxWidth) cachedWidth = changes.maxWidth.newValue || (cachedUnit === 'percent' ? 90 : 1200);
    if (changes.maxWidth || changes.widthUnit) applyMaxWidth();
  });

  // --- 最下部スクロールボタン ---
  const btn = document.createElement('button');
  btn.className = 'castor-scroll-btn castor-visible';
  btn.textContent = '↓';
  btn.title = '最下部へスクロール';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('castor-scroll-bottom'));
  });

  // --- Enter=改行, Ctrl+Enter=送信 ---
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    const editor = e.target.closest('.ql-editor');
    if (!editor) return;

    if (e.ctrlKey) {
      // Ctrl+Enter: 送信ボタンをクリック
      e.preventDefault();
      e.stopImmediatePropagation();
      const sendBtn = document.querySelector('.send-button:not(.stop), [aria-label*="送信"]');
      if (sendBtn) sendBtn.click();
    } else if (!e.shiftKey && !e.metaKey) {
      // Enter単体: 改行挿入（Geminiのデフォルト送信を阻止）
      e.preventDefault();
      e.stopImmediatePropagation();
      document.execCommand('insertLineBreak');
    }
  }, true);

  // --- Ctrl+C: 停止ボタンクリック ---
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c' && !window.getSelection().toString()) {
      const stopBtn = document.querySelector('[aria-label*="停止"], [aria-label*="stop"], button.stop');
      if (stopBtn) {
        e.preventDefault();
        e.stopImmediatePropagation();
        stopBtn.click();
      }
    }
  }, true);
})();
