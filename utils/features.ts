// 機能ごとのオン・オフ設定（popup と content script で共有）
import { browser } from 'wxt/browser';

export interface Features {
  /** Enter 単体で改行する（オフなら Gemini 本来の Enter=送信） */
  enterNewline: boolean;
  /** Ctrl+Enter で送信する */
  ctrlEnterSend: boolean;
  /** Cmd+Enter でも送信する（macOS 向け） */
  cmdEnterSend: boolean;
  /** 生成中に Ctrl+C で停止する */
  ctrlCStop: boolean;
  /** 最下部スクロールボタンを表示する */
  scrollButton: boolean;
}

export type FeatureKey = keyof Features;

// 既定値は、オン・オフ設定を追加する前（v1.1.0 まで）の動作に合わせる
export const DEFAULT_FEATURES: Features = {
  enterNewline: true,
  ctrlEnterSend: true,
  cmdEnterSend: false,
  ctrlCStop: true,
  scrollButton: true,
};

export const FEATURE_KEYS = Object.keys(DEFAULT_FEATURES) as FeatureKey[];

// 1 つのキーにまとめて保存する（項目を増やしても storage のキーが増えない）
export const FEATURES_KEY = 'features';

/** storage の生データを検証済みの設定に変換する。boolean 以外の値や未知のキーは無視し、既定値を使う */
export const parseFeatures = (raw: unknown): Features => {
  const features = { ...DEFAULT_FEATURES };
  if (typeof raw !== 'object' || raw === null) return features;
  const record = raw as Record<string, unknown>;
  for (const key of FEATURE_KEYS) {
    const value = record[key];
    if (typeof value === 'boolean') features[key] = value;
  }
  return features;
};

export const loadFeatures = async (): Promise<Features> => {
  const data = await browser.storage.local.get(FEATURES_KEY);
  return parseFeatures(data[FEATURES_KEY]);
};

export const saveFeatures = (features: Features): Promise<void> =>
  browser.storage.local.set({ [FEATURES_KEY]: features });
