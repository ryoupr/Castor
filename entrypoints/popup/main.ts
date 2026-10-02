type WidthUnit = 'percent' | 'px';

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

const defaults: Record<WidthUnit, number> = { percent: 90, px: 1200 };
const limits: Record<WidthUnit, { min: number; max: number; step: number }> = {
  percent: { min: 50, max: 100, step: 5 },
  px: { min: 600, max: 3000, step: 50 },
};
let currentUnit: WidthUnit = 'percent';

const setUnit = (unit: WidthUnit) => {
  currentUnit = unit;
  btnPercent.classList.toggle('active', unit === 'percent');
  btnPx.classList.toggle('active', unit === 'px');
  unitLabel.textContent = unit === 'percent' ? '%' : 'px';
  input.min = String(limits[unit].min);
  input.max = String(limits[unit].max);
  input.step = String(limits[unit].step);
};

const save = () => {
  let val = parseInt(input.value, 10);
  if (Number.isNaN(val)) return;
  const { min, max } = limits[currentUnit];
  val = Math.max(min, Math.min(max, val));
  input.value = String(val);
  void browser.storage.local.set({ maxWidth: val, widthUnit: currentUnit });
  status.textContent = '保存しました';
  setTimeout(() => (status.textContent = ''), 1500);
};

browser.storage.local.get(['maxWidth', 'widthUnit']).then((data) => {
  const unit = (data.widthUnit as WidthUnit | undefined) || 'percent';
  setUnit(unit);
  input.value = String((data.maxWidth as number | undefined) || defaults[unit]);
}).catch(() => {
  setUnit('percent');
  input.value = String(defaults.percent);
});

btnPercent.addEventListener('click', () => {
  if (currentUnit === 'percent') return;
  setUnit('percent');
  input.value = String(defaults.percent);
  save();
});

btnPx.addEventListener('click', () => {
  if (currentUnit === 'px') return;
  setUnit('px');
  input.value = String(defaults.px);
  save();
});

input.addEventListener('input', save);
input.addEventListener('change', save);
