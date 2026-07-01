import { useEffect, useRef } from 'react'
import type { CorrectionError, TokenUsage } from '../types'
import { colors, fontFamilies } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface Segment {
  text: string
  errorIndex: number | null
}

// 在纠正后的全文里定位每条错误的 to 片段，拆成可高亮的段。
// 为每条错误各自寻找一个不与其它错误重叠的出现位置（与错误数组顺序无关），
// 这样即使模型给出的错误顺序和文中出现顺序不一致，也不会漏掉某处高亮，
// 同时通过「跳过已占用区间」来区分重复出现的相同片段。
function buildSegments(text: string, errors: CorrectionError[]): Segment[] {
  const taken: { start: number; end: number; errorIndex: number }[] = []
  errors.forEach((err, i) => {
    if (!err.to) return
    let from = 0
    while (from <= text.length) {
      const idx = text.indexOf(err.to, from)
      if (idx === -1) return
      const end = idx + err.to.length
      const overlaps = taken.some((t) => idx < t.end && end > t.start)
      if (!overlaps) {
        taken.push({ start: idx, end, errorIndex: i })
        return
      }
      from = idx + 1
    }
  })
  taken.sort((a, b) => a.start - b.start)

  const segments: Segment[] = []
  let cursor = 0
  taken.forEach((t) => {
    if (t.start < cursor) return
    if (t.start > cursor) segments.push({ text: text.slice(cursor, t.start), errorIndex: null })
    segments.push({ text: text.slice(t.start, t.end), errorIndex: t.errorIndex })
    cursor = t.end
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
  usage?: TokenUsage
  errorMessage: string
  onRetry: () => void
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
  usage,
  errorMessage,
  onRetry,
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
                        ? colors.greenSelect
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
            {usage && (
              <div
                style={{
                  padding: '0 20px 16px',
                  fontSize: 11,
                  color: colors.muted2,
                  letterSpacing: '0.02em',
                }}
              >
                本次用量 · 输入 {usage.promptTokens} · 输出 {usage.completionTokens} · 共{' '}
                {usage.totalTokens} tokens
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
            <div style={{ marginTop: 12 }}>
              <button
                className="btn-ghost"
                onClick={onRetry}
                style={{
                  border: `1px solid ${colors.divider}`,
                  background: colors.white,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  color: colors.muted4,
                  padding: '6px 16px',
                  borderRadius: 8,
                }}
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
