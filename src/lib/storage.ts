import type { HistoryEntry, Preferences, Settings } from '../types'

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
  temperature: 0.2,
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

export const loadSettings = () => load(SETTINGS_KEY, DEFAULT_SETTINGS)
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
