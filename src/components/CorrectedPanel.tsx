import { colors, fontFamilies } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  status: Status
  correctedText: string
  translation: string
  showTranslation: boolean
  onToggleTranslation: () => void
  errorMessage: string
  fontFamily: string
  fontSize: string
  copied: boolean
  onCopy: () => void
}

export default function CorrectedPanel({
  status,
  correctedText,
  translation,
  showTranslation,
  onToggleTranslation,
  errorMessage,
  fontFamily,
  fontSize,
  copied,
  onCopy,
}: Props) {
  const textStyle = {
    color: colors.inkSoft,
    fontFamily,
    fontSize,
    lineHeight: 1.85,
    padding: '18px 20px',
    whiteSpace: 'pre-wrap' as const,
  }
  const bodyStyle = {
    flex: 1,
    minHeight: 0,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn-ghost"
              onClick={onToggleTranslation}
              aria-pressed={showTranslation}
              title={showTranslation ? '隐藏中文含义' : '显示中文含义'}
              style={{
                border: `1px solid ${showTranslation ? colors.green : colors.divider}`,
                background: showTranslation ? colors.greenSoft : colors.white,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                color: showTranslation ? colors.green : colors.muted4,
                padding: '5px 13px',
                borderRadius: 7,
              }}
            >
              中文
            </button>
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
          </div>
        )}
      </div>

      <div style={bodyStyle}>
        {status === 'done' && (
          <>
            <div style={textStyle}>{correctedText}</div>
            {showTranslation && translation && (
              <div style={{ borderTop: `1px solid ${colors.border}`, margin: '0 20px' }}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    color: colors.muted1,
                    padding: '16px 0 10px',
                  }}
                >
                  中文含义
                </div>
                <p
                  style={{
                    margin: 0,
                    paddingBottom: 18,
                    color: colors.muted4,
                    fontFamily: fontFamilies.sans,
                    fontSize: 14,
                    lineHeight: 1.85,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {translation}
                </p>
              </div>
            )}
          </>
        )}
        {status === 'idle' && (
          <div style={{ padding: '18px 20px' }}>
            <span style={{ color: colors.muted5 }}>
              纠正后的全文会显示在这里，排版与上方输入框一致，可直接复制。
            </span>
          </div>
        )}
        {status === 'loading' && (
          <div style={{ padding: '18px 20px' }}>
            <span style={{ color: colors.muted5 }}>正在纠错中……</span>
          </div>
        )}
        {status === 'error' && (
          <div style={{ padding: '18px 20px' }}>
            <span style={{ color: colors.red }}>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  )
}
