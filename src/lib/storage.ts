import type { Preferences, Settings } from '../types'

const SETTINGS_KEY = 'xxzs.settings'
const PREFS_KEY = 'xxzs.prefs'

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
