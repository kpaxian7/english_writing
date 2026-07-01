import type { HistoryEntry, Preferences, Settings } from '../types'
import { HOSTED_KEY, HOSTED_BASE_URL, HOSTED_MODEL, HOSTED_MODELS, IS_HOSTED } from './hosted'

const SETTINGS_KEY = 'xxzs.settings'
const PREFS_KEY = 'xxzs.prefs'
const HISTORY_KEY = 'xxzs.history'
const HISTORY_LIMIT = 30

export const DEFAULT_SETTINGS: Settings = {
  // 默认指向 DeepSeek —— 对浏览器直连（CORS）友好，国内可用。
  // 用户可在设置里改为任意 OpenAI 兼容端点。
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
}

export const DEFAULT_PREFS: Preferences = {
  writingFont: '衬线',
  highlightChanges: true,
  showNotes: true,
  showTranslation: true,
  theme: 'light',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* localStorage 不可用时静默忽略 */
  }
}

export function loadSettings(): Settings {
  const loaded = load(SETTINGS_KEY, DEFAULT_SETTINGS)
  if (!IS_HOSTED) return loaded
  // 托管模式：Key / 地址强制用注入值（用户不可改）；模型仅限白名单，非法则回退默认。
  const model = HOSTED_MODELS.includes(loaded.model) ? loaded.model : HOSTED_MODEL || loaded.model
  return { ...loaded, apiKey: HOSTED_KEY, baseUrl: HOSTED_BASE_URL || loaded.baseUrl, model }
}
export const saveSettings = (s: Settings) => save(SETTINGS_KEY, s)
export const loadPrefs = () => load(PREFS_KEY, DEFAULT_PREFS)
export const savePrefs = (p: Preferences) => save(PREFS_KEY, p)

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// 只保留最近 HISTORY_LIMIT 条。
export function saveHistory(list: HistoryEntry[]): void {
  save(HISTORY_KEY, list.slice(0, HISTORY_LIMIT))
}
