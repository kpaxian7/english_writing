import { colors } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  status: Status
  correctedText: string
  errorMessage: string
  fontFamily: string
  fontSize: string
  copied: boolean
  onCopy: () => void
}

export default function CorrectedPanel({
  status,
  correctedText,
  errorMessage,
  fontFamily,
  fontSize,
  copied,
  onCopy,
}: Props) {
  const bodyStyle = {
    flex: 1,
    minHeight: 0,
    color: colors.inkSoft,
    fontFamily,
    fontSize,
    lineHeight: 1.85,
    padding: '18px 20px',
    whiteSpace: 'pre-wrap' as const,
    overflowY: 'auto' as const,
  }

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
          background: colors.panelHead,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.22em', color: colors.green }}>
          已纠正 · 不可编辑
        </span>
        {status === 'done' && (
          <button
            className="btn-ghost"
            onClick={onCopy}
            style={{
              border: `1px solid ${colors.divider}`,
              background: colors.white,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              color: colors.muted4,
              padding: '5px 13px',
              borderRadius: 7,
            }}
          >
            {copied ? '已复制 ✓' : '复制全文'}
          </button>
        )}
      </div>

      <div style={bodyStyle}>
        {status === 'done' && correctedText}
        {status === 'idle' && (
          <span style={{ color: colors.muted5 }}>
            纠正后的全文会显示在这里，排版与上方输入框一致，可直接复制。
          </span>
        )}
        {status === 'loading' && <span style={{ color: colors.muted5 }}>正在纠错中……</span>}
        {status === 'error' && <span style={{ color: colors.red }}>{errorMessage}</span>}
      </div>
    </div>
  )
}
