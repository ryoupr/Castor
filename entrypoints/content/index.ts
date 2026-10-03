// Castor - Gemini UI Enhancer
import './style.css';
import { findChatScroller, findSendButton, findStopButton } from '@/utils/gemini-dom';
import { STORAGE_KEYS, type WidthSettings, loadWidthSettings, toCssWidth } from '@/utils/settings';

// input / textarea 内の選択は window.getSelection() に現れないため、個別に確認する
const hasTextSelection = (target: EventTarget | null): boolean => {
  if (
    (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
    target.selectionStart !== null &&
    target.selectionStart !== target.selectionEnd
  ) {
    return true;
  }
  return !!window.getSelection()?.toString();
};

// スクロールボタンを表示する、最下部からの距離（px。この値以上離れているときに表示する）
const SCROLL_BTN_THRESHOLD = 200;

const distanceFromBottom = (el: HTMLElement): number => el.scrollHeight - el.scrollTop - el.clientHeight;

export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  runAt: 'document_end',
  main(ctx) {
    // --- 横幅設定の適用 ---
    const applyMaxWidth = (settings: WidthSettings) => {
      document.documentElement.style.setProperty('--castor-max-width', toCssWidth(settings));
    };

    // 変更が続いたとき、非同期の読み込み結果が前後して古い値が反映されないよう、最新の読み込みだけを適用する
    let loadSeq = 0;
    const reloadWidth = async () => {
      const seq = ++loadSeq;
      try {
        const settings = await loadWidthSettings();
        if (seq === loadSeq) applyMaxWidth(settings);
      } catch {
        // 拡張の再読み込み直後など storage が使えない場合は、現在の値（初回は CSS 既定の 90%）のまま
      }
    };
    void reloadWidth();

    const onStorageChanged = (changes: Record<string, unknown>) => {
      if (STORAGE_KEYS.some((key) => key in changes)) void reloadWidth();
    };
    browser.storage.onChanged.addListener(onStorageChanged);
    ctx.onInvalidated(() => browser.storage.onChanged.removeListener(onStorageChanged));

    // --- 最下部スクロールボタン ---
    // 最下部から SCROLL_BTN_THRESHOLD px 以上離れているときだけ表示する
    const btn = document.createElement('button');
    btn.className = 'castor-scroll-btn';
    btn.textContent = '↓';
    btn.title = browser.i18n.getMessage('scrollToBottom');
    btn.setAttribute('aria-label', btn.title);
    document.body.appendChild(btn);
    ctx.onInvalidated(() => btn.remove());

    const updateScrollBtn = () => {
      const scroller = findChatScroller();
      btn.classList.toggle('castor-visible', !!scroller && distanceFromBottom(scroller) >= SCROLL_BTN_THRESHOLD);
    };

    // 更新は 1 フレームに 1 回にまとめる（生成中は DOM の変更が頻繁に起きるため）
    // ctx.requestAnimationFrame は呼ぶたびに無効化時の後始末を登録して増え続けるため、素の requestAnimationFrame を使い、
    // 後始末は一度だけ登録する
    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateScrollBtn();
      });
    };
    ctx.onInvalidated(() => cancelAnimationFrame(rafId));

    // scroll はバブリングしないので、document の capture で受け取る
    ctx.addEventListener(document, 'scroll', scheduleUpdate, { capture: true, passive: true });
    // 回答の生成やチャットの切り替えで高さが変わったときも判定し直す
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    ctx.onInvalidated(() => observer.disconnect());
    scheduleUpdate();

    ctx.addEventListener(btn, 'click', () => {
      // isolated world でも DOM はページと共有されるので、直接スクロールできる:
      // https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#isolated_world
      findChatScroller()?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: 'smooth' });
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
          findSendButton()?.click();
        } else if (!e.shiftKey && !e.metaKey) {
          // Enter単体: 改行挿入（Geminiのデフォルト送信を阻止）
          e.preventDefault();
          e.stopImmediatePropagation();
          document.execCommand('insertLineBreak');
        }
      },
      { capture: true },
    );

    // --- Ctrl+C: 生成中なら停止ボタンをクリック（テキスト選択中は通常のコピー） ---
    ctx.addEventListener(
      document,
      'keydown',
      (e) => {
        if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.isComposing) return;
        // 非ラテン文字の配列（e.key が 'с' などになる）では物理キー位置 e.code で判定する。
        // ラテン文字の配列では e.key だけを見る（Dvorak では KeyC が 'j' なので、e.code を使うと Ctrl+J を横取りしてしまう）
        const isC = e.key.toLowerCase() === 'c' || (!/^[a-z]$/i.test(e.key) && e.code === 'KeyC');
        if (!isC || hasTextSelection(e.target)) return;
        // 停止ボタンは生成中しか存在しないので、生成中でなければ何もしない
        const stopBtn = findStopButton();
        if (!stopBtn) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        stopBtn.click();
      },
      { capture: true },
    );
  },
});
