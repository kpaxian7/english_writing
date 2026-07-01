// 一处纠错。cat 为中文分类，决定右侧圆点颜色。
export interface CorrectionError {
  cat: string
  from: string
  to: string
  note: string
}

// AI 返回的结构化纠错结果。
export interface CorrectionResult {
  corrected: string
  // 纠正后全文的中文翻译（自然意译，帮用户确认表达的意思）。
  translation: string
  errors: CorrectionError[]
}

// 一条纠错历史记录，保存在 localStorage，可回看/恢复。
export interface HistoryEntry {
  id: string
  ts: number
  input: string
  result: CorrectionResult
}

// 针对单处修改的深入讲解（第二次 AI 调用返回）。
export interface ErrorExplanation {
  detail: string
  examples: { en: string; zh: string }[]
}

// 用户在设置里填写的连接信息，保存在 localStorage。
export interface Settings {
  baseUrl: string
  apiKey: string
  model: string
  // 采样温度：越低越稳定，越高越多样。
  temperature: number
}

// 排版字体
export type WritingFont = '衬线' | '等宽'

// 深浅色主题
export type ThemeMode = 'light' | 'dark'

// 界面偏好（对应原型里的可调项）
export interface Preferences {
  writingFont: WritingFont
  highlightChanges: boolean
  showNotes: boolean
  // 是否在「已纠正」下方展示中文翻译。
  showTranslation: boolean
  theme: ThemeMode
}
