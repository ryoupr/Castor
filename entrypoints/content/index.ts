// Castor - Gemini UI Enhancer
import './style.css';
import { findSendButton, findStopButton } from '@/utils/gemini-dom';
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
          findSendButton()?.click();
        } else if (!e.shiftKey && !e.metaKey) {
          // Enter単体: Geminiのデフォルト送信を阻止し、Shift+Enter を送り直して改行させる。
          // 入力欄の Quill が Shift+Enter を改行として処理するので、Quill のデータ・Undo とずれない
          // （非推奨の document.execCommand('insertLineBreak') では、改行が本文の文字として入り、Quill とずれていた）。
          // 送り直したイベントは shiftKey 付きなので、このリスナーは素通りする
          e.preventDefault();
          e.stopImmediatePropagation();
          editor.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              // keyCode / which は非推奨だが、Quill のキー割り当ての照合が which も見るため残す
              keyCode: 13,
              which: 13,
              shiftKey: true,
              bubbles: true,
              cancelable: true,
              composed: true,
            }),
          );
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
