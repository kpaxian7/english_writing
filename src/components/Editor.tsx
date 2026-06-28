import { colors } from '../theme'

interface Props {
  text: string
  onChange: (v: string) => void
  fontFamily: string
  fontSize: string
  wordCount: number
}

export default function Editor({ text, onChange, fontFamily, fontSize, wordCount }: Props) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: 13,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(31,30,27,0.03)',
      }}
    >
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 20px',
          borderBottom: `1px solid ${colors.borderSoft}`,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.22em', color: colors.muted1 }}>
          原文 · 可编辑
        </span>
        <span style={{ fontSize: 12, color: colors.muted2 }}>{wordCount} 词</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="在这里写下你的英文——拼错、语序乱、时态错都没关系。"
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          border: 'none',
          outline: 'none',
          resize: 'none',
          background: 'transparent',
          color: colors.ink,
          fontFamily,
          fontSize,
          lineHeight: 1.85,
          padding: '18px 20px',
          display: 'block',
          overflowY: 'auto',
        }}
      />
    </div>
  )
}
