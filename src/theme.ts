// 设计令牌 —— 还原原型「暖纸 + 墨绿」的配色。
// 具体色值定义在 index.css 的 CSS 变量里，随 data-theme 在浅/深色间切换。
export const colors = {
  paper: 'var(--c-paper)',
  ink: 'var(--c-ink)',
  inkSoft: 'var(--c-ink-soft)',
  green: 'var(--c-green)',
  greenDark: 'var(--c-green-dark)',
  greenSoft: 'var(--c-green-soft)',
  red: 'var(--c-red)',
  redLine: 'var(--c-red-line)',

  border: 'var(--c-border)',
  borderSoft: 'var(--c-border-soft)',
  borderFaint: 'var(--c-border-faint)',
  divider: 'var(--c-divider)',

  muted1: 'var(--c-muted1)',
  muted2: 'var(--c-muted2)',
  muted3: 'var(--c-muted3)',
  muted4: 'var(--c-muted4)',
  muted5: 'var(--c-muted5)',
  panelHead: 'var(--c-panel-head)',
  white: 'var(--c-white)',
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
