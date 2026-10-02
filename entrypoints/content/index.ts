// Castor - Gemini UI Enhancer
import './style.css';

type WidthUnit = 'percent' | 'px';

const DEFAULT_WIDTH: Record<WidthUnit, number> = { percent: 90, px: 1200 };

export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  runAt: 'document_end',
  main(ctx) {
    // --- 横幅設定の適用 ---
    let cachedUnit: WidthUnit = 'percent';
    let cachedWidth = DEFAULT_WIDTH.percent;

    const applyMaxWidth = () => {
      const css = cachedUnit === 'percent' ? `${cachedWidth}%` : `${cachedWidth}px`;
      document.documentElement.style.setProperty('--castor-max-width', css);
    };

    browser.storage.local.get(['maxWidth', 'widthUnit']).then((data) => {
      cachedUnit = (data.widthUnit as WidthUnit | undefined) || 'percent';
      cachedWidth = (data.maxWidth as number | undefined) || DEFAULT_WIDTH[cachedUnit];
      applyMaxWidth();
    }).catch(() => {
      // 拡張の再読み込み直後など storage が使えない場合は既定値のまま
      applyMaxWidth();
    });

    const onStorageChanged = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes.widthUnit) cachedUnit = (changes.widthUnit.newValue as WidthUnit | undefined) || 'percent';
      if (changes.maxWidth) {
        cachedWidth = (changes.maxWidth.newValue as number | undefined) || DEFAULT_WIDTH[cachedUnit];
      }
      if (changes.maxWidth || changes.widthUnit) applyMaxWidth();
    };
    browser.storage.onChanged.addListener(onStorageChanged);
    ctx.onInvalidated(() => browser.storage.onChanged.removeListener(onStorageChanged));

    // --- 最下部スクロールボタン ---
    const btn = document.createElement('button');
    btn.className = 'castor-scroll-btn castor-visible';
    btn.textContent = '↓';
    btn.title = browser.i18n.getMessage('scrollToBottom');
    btn.setAttribute('aria-label', btn.title);
    document.body.appendChild(btn);
    ctx.onInvalidated(() => btn.remove());

    ctx.addEventListener(btn, 'click', () => {
      // スクロール処理は MAIN world の scroll-helper が担当
      window.dispatchEvent(new CustomEvent('castor-scroll-bottom'));
    });

    // --- Enter=改行, Ctrl+Enter=送信 ---
    ctx.addEventListener(
      document,
      'keydown',
      (e) => {
        if (e.key !== 'Enter' || e.isComposing) return;
        if (!(e.target instanceof Element)) return;
        const editor = e.target.closest('.ql-editor');
        if (!editor) return;

        if (e.ctrlKey) {
          // Ctrl+Enter: 送信ボタンをクリック
          e.preventDefault();
          e.stopImmediatePropagation();
          const sendBtn = document.querySelector<HTMLElement>('.send-button:not(.stop), [aria-label*="送信"]');
          sendBtn?.click();
        } else if (!e.shiftKey && !e.metaKey) {
          // Enter単体: 改行挿入（Geminiのデフォルト送信を阻止）
          e.preventDefault();
          e.stopImmediatePropagation();
          document.execCommand('insertLineBreak');
        }
      },
      { capture: true },
    );

    // --- Ctrl+C: 停止ボタンクリック ---
    ctx.addEventListener(
      document,
      'keydown',
      (e) => {
        if (e.ctrlKey && e.key === 'c' && !window.getSelection()?.toString()) {
          const stopBtn = document.querySelector<HTMLElement>('[aria-label*="停止"], [aria-label*="stop"], button.stop');
          if (stopBtn) {
            e.preventDefault();
            e.stopImmediatePropagation();
            stopBtn.click();
          }
        }
      },
      { capture: true },
    );
  },
});
