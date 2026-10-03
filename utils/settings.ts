// 横幅設定の型・既定値・読み込みをまとめたモジュール（popup と content script で共有）
import { browser } from 'wxt/browser';

export type WidthUnit = 'percent' | 'px';

export const WIDTH_LIMITS: Record<WidthUnit, { min: number; max: number; step: number; default: number }> = {
  percent: { min: 50, max: 100, step: 5, default: 90 },
  px: { min: 600, max: 3000, step: 50, default: 1200 },
};

// 単位ごとに値を別キーで保存し、単位を切り替えても前回値を失わないようにする
export const WIDTH_KEYS: Record<WidthUnit, string> = {
  percent: 'maxWidthPercent',
  px: 'maxWidthPx',
};
export const UNIT_KEY = 'widthUnit';
// v1.1.0 までの保存キー（現在の単位の値だけを保持していた）
export const LEGACY_WIDTH_KEY = 'maxWidth';

export const STORAGE_KEYS = [UNIT_KEY, WIDTH_KEYS.percent, WIDTH_KEYS.px, LEGACY_WIDTH_KEY];

export interface WidthSettings {
  unit: WidthUnit;
  values: Record<WidthUnit, number>;
}

export const isWidthUnit = (v: unknown): v is WidthUnit => v === 'percent' || v === 'px';

export const clampWidth = (unit: WidthUnit, value: number): number => {
  const { min, max } = WIDTH_LIMITS[unit];
  return Math.max(min, Math.min(max, Math.round(value)));
};

const toValidWidth = (unit: WidthUnit, v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? clampWidth(unit, v) : undefined;

/** storage の生データを検証済みの設定に変換する。旧キー maxWidth は保存時の単位の値として扱う */
export const parseWidthSettings = (data: Record<string, unknown>): WidthSettings => {
  const unit = isWidthUnit(data[UNIT_KEY]) ? data[UNIT_KEY] : 'percent';
  const value = (u: WidthUnit) =>
    toValidWidth(u, data[WIDTH_KEYS[u]]) ??
    (u === unit ? toValidWidth(u, data[LEGACY_WIDTH_KEY]) : undefined) ??
    WIDTH_LIMITS[u].default;
  return { unit, values: { percent: value('percent'), px: value('px') } };
};

export const readWidthStorage = (): Promise<Record<string, unknown>> => browser.storage.local.get(STORAGE_KEYS);

export const loadWidthSettings = async (): Promise<WidthSettings> => parseWidthSettings(await readWidthStorage());

export const hasLegacyWidth = (data: Record<string, unknown>): boolean => LEGACY_WIDTH_KEY in data;

export const toCssWidth = ({ unit, values }: WidthSettings): string =>
  unit === 'percent' ? `${values.percent}%` : `${values.px}px`;
