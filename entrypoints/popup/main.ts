import {
  type WidthSettings,
  type WidthUnit,
  LEGACY_WIDTH_KEY,
  UNIT_KEY,
  WIDTH_KEYS,
  WIDTH_LIMITS,
  clampWidth,
  hasLegacyWidth,
  parseWidthSettings,
  readWidthStorage,
} from '@/utils/settings';

const getEl = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} が見つかりません`);
  return el as T;
};

const input = getEl<HTMLInputElement>('maxWidth');
const unitLabel = getEl<HTMLSpanElement>('unitLabel');
const btnPercent = getEl<HTMLButtonElement>('btnPercent');
const btnPx = getEl<HTMLButtonElement>('btnPx');
const status = getEl<HTMLDivElement>('status');

// --- i18n: ブラウザの UI 言語に合わせて文言・lang・dir を適用 ---
document.documentElement.lang = browser.i18n.getUILanguage();
document.documentElement.dir = browser.i18n.getMessage('@@bidi_dir') || 'ltr';
document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
  const key = el.dataset.i18n;
  const msg = key ? browser.i18n.getMessage(key as Parameters<typeof browser.i18n.getMessage>[0]) : '';
  if (msg) el.textContent = msg;
});

let settings: WidthSettings = parseWidthSettings({});
let statusTimer: ReturnType<typeof setTimeout> | undefined;

const setControlsEnabled = (enabled: boolean) => {
  for (const el of [input, btnPercent, btnPx]) el.disabled = !enabled;
};

const render = () => {
  const { unit, values } = settings;
  const limits = WIDTH_LIMITS[unit];
  btnPercent.classList.toggle('active', unit === 'percent');
  btnPx.classList.toggle('active', unit === 'px');
  unitLabel.textContent = unit === 'percent' ? '%' : 'px';
  input.min = String(limits.min);
  input.max = String(limits.max);
  input.step = String(limits.step);
  input.value = String(values[unit]);
};

const showSaved = () => {
  status.textContent = browser.i18n.getMessage('saved');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (status.textContent = ''), 1500);
};

// 変更したキーだけを書く（別の単位の値を古いスナップショットで上書きしないため）
const saveUnit = () => {
  void browser.storage.local.set({ [UNIT_KEY]: settings.unit });
  showSaved();
};
const saveValue = (unit: WidthUnit, value: number) => {
  if (settings.values[unit] === value) return;
  settings.values[unit] = value;
  void browser.storage.local.set({ [WIDTH_KEYS[unit]]: value });
  showSaved();
};

// 入力途中（例: 80 を打つ途中の 8）で値を丸めて書き戻すと直接入力できなくなるため、
// input では範囲内の整数のときだけ保存し、丸めと書き戻しは change（確定時）に行う
input.addEventListener('input', () => {
  const val = Number(input.value);
  const { min, max } = WIDTH_LIMITS[settings.unit];
  if (input.value === '' || !Number.isInteger(val) || val < min || val > max) return;
  saveValue(settings.unit, val);
});

input.addEventListener('change', () => {
  const val = Number(input.value);
  if (input.value !== '' && Number.isFinite(val)) saveValue(settings.unit, clampWidth(settings.unit, val));
  // 丸めた値、または空欄・不正値のときは保存済みの値を表示する
  input.value = String(settings.values[settings.unit]);
});

// 単位を切り替えても、それぞれの単位で前回保存した値を復元する
const switchUnit = (unit: WidthUnit) => {
  if (settings.unit === unit) return;
  settings.unit = unit;
  render();
  saveUnit();
};
btnPercent.addEventListener('click', () => switchUnit('percent'));
btnPx.addEventListener('click', () => switchUnit('px'));

// 旧形式（maxWidth）の値を新キーへ一度だけ移行する
const migrateLegacy = async () => {
  await browser.storage.local.set({
    [WIDTH_KEYS.percent]: settings.values.percent,
    [WIDTH_KEYS.px]: settings.values.px,
  });
  await browser.storage.local.remove(LEGACY_WIDTH_KEY);
};

// 読み込みが終わるまで操作できないようにし、読み込み結果で操作内容が上書きされるのを防ぐ
setControlsEnabled(false);
readWidthStorage()
  .then((data) => {
    settings = parseWidthSettings(data);
    if (hasLegacyWidth(data)) {
      migrateLegacy().catch(() => {
        // 移行に失敗しても旧キーが残るだけで、parseWidthSettings が旧キーを読めるので動作に影響はない
      });
    }
  })
  .catch(() => {
    // storage が使えない場合は既定値のまま表示する
  })
  .finally(() => {
    render();
    setControlsEnabled(true);
  });
