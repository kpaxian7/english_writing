// 设计令牌 —— 还原原型「暖纸 + 墨绿」的配色。
export const colors = {
  paper: '#FBFAF7',
  ink: '#1F1E1B',
  inkSoft: '#26251F',
  green: '#2E6B4F',
  greenDark: '#244F39',
  greenSoft: 'rgba(46,107,79,0.10)',
  red: '#B2554C',
  redLine: 'rgba(178,85,76,0.45)',

  border: '#ECE9E2',
  borderSoft: '#F1EEE8',
  borderFaint: '#F4F1EB',
  divider: '#E2DFD8',

  muted1: '#A8A49C',
  muted2: '#BDB9B1',
  muted3: '#9A9791',
  muted4: '#6B6862',
  muted5: '#C4C0B8',
  panelHead: '#FCFBF8',
  white: '#fff',
}

// 分类 -> 圆点颜色。未知分类回退到灰色。
const CATEGORY_COLORS: Record<string, string> = {
  时态: '#5B7DB1',
  句式: '#9A6FB0',
  缺词: '#B2554C',
  用词: '#C08A4B',
  拼写: '#4F9D8E',
  冠词: '#C77F9B',
  单复数: '#7E8B3D',
  介词: '#5C8AC0',
  标点: '#9A9791',
  其他: '#9A9791',
}

// 允许 AI 使用的分类集合（用于约束 prompt，保证颜色一致）。
export const ALLOWED_CATEGORIES = Object.keys(CATEGORY_COLORS)

export function dotColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? '#9A9791'
}

export const fontFamilies = {
  serif: "'Newsreader','Noto Serif SC',Georgia,serif",
  mono: "'IBM Plex Mono','Noto Sans SC',ui-monospace,monospace",
  sans: "'Noto Sans SC',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
  brand: "'Noto Serif SC','Newsreader',serif",
}
