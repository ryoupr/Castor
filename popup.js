const input = document.getElementById('maxWidth');
const unitLabel = document.getElementById('unitLabel');
const btnPercent = document.getElementById('btnPercent');
const btnPx = document.getElementById('btnPx');
const status = document.getElementById('status');

const defaults = { percent: 90, px: 1200 };
let currentUnit = 'percent';

const setUnit = (unit) => {
  currentUnit = unit;
  btnPercent.classList.toggle('active', unit === 'percent');
  btnPx.classList.toggle('active', unit === 'px');
  unitLabel.textContent = unit === 'percent' ? '%' : 'px';
  input.min = unit === 'percent' ? 50 : 600;
  input.max = unit === 'percent' ? 100 : 3000;
  input.step = unit === 'percent' ? 5 : 50;
};

const limits = { percent: { min: 50, max: 100 }, px: { min: 600, max: 3000 } };

const save = () => {
  let val = parseInt(input.value, 10);
  if (isNaN(val)) return;
  const { min, max } = limits[currentUnit];
  val = Math.max(min, Math.min(max, val));
  input.value = val;
  chrome.storage.local.set({ maxWidth: val, widthUnit: currentUnit });
  status.textContent = '保存しました';
  setTimeout(() => status.textContent = '', 1500);
};

chrome.storage.local.get(['maxWidth', 'widthUnit'], (data) => {
  const unit = data.widthUnit || 'percent';
  setUnit(unit);
  input.value = data.maxWidth || defaults[unit];
});

btnPercent.addEventListener('click', () => {
  if (currentUnit === 'percent') return;
  setUnit('percent');
  input.value = defaults.percent;
  save();
});

btnPx.addEventListener('click', () => {
  if (currentUnit === 'px') return;
  setUnit('px');
  input.value = defaults.px;
  save();
});

input.addEventListener('input', save);
input.addEventListener('change', save);
