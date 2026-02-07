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
})();
