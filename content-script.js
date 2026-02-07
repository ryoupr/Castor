// Castor - Gemini UI Enhancer
(() => {
  // --- 横幅設定の適用 ---
  const applyMaxWidth = (val, unit) => {
    const css = unit === 'percent' ? val + '%' : val + 'px';
    document.documentElement.style.setProperty('--castor-max-width', css);
  };

  chrome.storage.local.get(['maxWidth', 'widthUnit'], (data) => {
    const unit = data.widthUnit || 'percent';
    applyMaxWidth(data.maxWidth || (unit === 'percent' ? 90 : 1200), unit);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.maxWidth || changes.widthUnit) {
      chrome.storage.local.get(['maxWidth', 'widthUnit'], (data) => {
        const unit = data.widthUnit || 'percent';
        applyMaxWidth(data.maxWidth || (unit === 'percent' ? 90 : 1200), unit);
      });
    }
  });

  // --- 最下部スクロールボタン ---
  const btn = document.createElement('button');
  btn.className = 'castor-scroll-btn';
  btn.textContent = '↓';
  btn.title = '最下部へスクロール';
  document.body.appendChild(btn);

  let scrollTarget = null;

  const findScrollContainer = () => {
    const candidates = document.querySelectorAll('[class*="scroll"], [class*="chat"], main, [role="main"]');
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 100) return el;
    }
    return document.documentElement;
  };

  const updateVisibility = () => {
    const el = scrollTarget || findScrollContainer();
    scrollTarget = el;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    btn.classList.toggle('castor-visible', distanceFromBottom > 200);
  };

  btn.addEventListener('click', () => {
    const el = scrollTarget || findScrollContainer();
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  });

  document.addEventListener('scroll', updateVisibility, true);

  new MutationObserver(() => {
    scrollTarget = null;
    updateVisibility();
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(updateVisibility, 1000);

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
