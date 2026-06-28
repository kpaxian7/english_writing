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
  errors: CorrectionError[]
}

// 用户在设置里填写的连接信息，保存在 localStorage。
export interface Settings {
  baseUrl: string
  apiKey: string
  model: string
}

// 排版字体
export type WritingFont = '衬线' | '等宽'

// 界面偏好（对应原型里的可调项）
export interface Preferences {
  writingFont: WritingFont
  highlightChanges: boolean
  showNotes: boolean
}
