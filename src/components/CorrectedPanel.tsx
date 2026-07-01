import { useEffect, useRef } from 'react'
import type { CorrectionError } from '../types'
import { colors, fontFamilies } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface Segment {
  text: string
  errorIndex: number | null
}

// 在纠正后的全文里按顺序定位每条错误的 to 片段，拆成可高亮的段。
function buildSegments(text: string, errors: CorrectionError[]): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  errors.forEach((err, i) => {
    if (!err.to) return
    const idx = text.indexOf(err.to, cursor)
    if (idx === -1) return
    if (idx > cursor) segments.push({ text: text.slice(cursor, idx), errorIndex: null })
    segments.push({ text: err.to, errorIndex: i })
    cursor = idx + err.to.length
  })
  if (cursor < text.length) segments.push({ text: text.slice(cursor), errorIndex: null })
  if (segments.length === 0) segments.push({ text, errorIndex: null })
  return segments
}

interface Props {
  status: Status
  correctedText: string
  errors: CorrectionError[]
  selectedError: number | null
  onSelectError: (i: number | null) => void
  highlightChanges: boolean
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
  errors,
  selectedError,
  onSelectError,
  highlightChanges,
  translation,
  showTranslation,
  onToggleTranslation,
  errorMessage,
  fontFamily,
  fontSize,
  copied,
  onCopy,
}: Props) {
  const selectedRef = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    if (selectedError !== null && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedError])

  const segments = buildSegments(correctedText, errors)

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
      className="panel-corrected"
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
              title={showTranslation && translation ? '复制英文 + 中文翻译' : '复制英文'}
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
              {copied ? '已复制 ✓' : showTranslation && translation ? '复制中英' : '复制全文'}
            </button>
          </div>
        )}
      </div>

      <div style={bodyStyle}>
        {status === 'done' && (
          <>
            <div style={textStyle}>
              {segments.map((seg, i) => {
                const { text, errorIndex } = seg
                if (errorIndex === null) return <span key={i}>{text}</span>
                const isSelected = errorIndex === selectedError
                return (
                  <span
                    key={i}
                    ref={isSelected ? selectedRef : undefined}
                    onClick={() => onSelectError(isSelected ? null : errorIndex)}
                    title="点击定位到右侧对应的修改说明"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      padding: '0 2px',
                      background: isSelected
                        ? 'rgba(46,107,79,0.22)'
                        : highlightChanges
                          ? colors.greenSoft
                          : 'transparent',
                      color: isSelected ? colors.greenDark : undefined,
                      boxShadow: isSelected ? `0 0 0 1px ${colors.green}` : undefined,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {text}
                  </span>
                )
              })}
            </div>
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
