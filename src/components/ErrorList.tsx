import { useEffect, useRef, useState } from 'react'
import type { CorrectionError, ErrorExplanation, Settings } from '../types'
import { explainError, AIError } from '../lib/ai'
import { colors, dotColor, fontFamilies } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface ExplainState {
  open: boolean
  status: 'loading' | 'done' | 'error'
  data?: ErrorExplanation
  message?: string
}

interface Props {
  status: Status
  errors: CorrectionError[]
  highlightChanges: boolean
  showNotes: boolean
  selectedError: number | null
  onSelectError: (i: number | null) => void
  settings: Settings
  contextText: string
}

export default function ErrorList({
  status,
  errors,
  highlightChanges,
  showNotes,
  selectedError,
  onSelectError,
  settings,
  contextText,
}: Props) {
  const selectedRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (selectedError !== null && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedError])

  // 每处错误的「详解」展开状态（按索引存），换一批错误时清空。
  const [explains, setExplains] = useState<Record<number, ExplainState>>({})
  useEffect(() => {
    setExplains({})
  }, [errors])

  async function fetchExplain(i: number, err: CorrectionError) {
    try {
      const data = await explainError(err, contextText, settings)
      setExplains((prev) => ({ ...prev, [i]: { open: prev[i]?.open ?? true, status: 'done', data } }))
    } catch (e) {
      const message = e instanceof AIError ? e.message : '获取详解失败，请重试。'
      setExplains((prev) => ({ ...prev, [i]: { open: prev[i]?.open ?? true, status: 'error', message } }))
    }
  }

  function toggleExplain(i: number, err: CorrectionError) {
    const cur = explains[i]
    if (cur?.open) {
      setExplains((prev) => ({ ...prev, [i]: { ...prev[i], open: false } }))
      return
    }
    if (cur && (cur.status === 'done' || cur.status === 'loading')) {
      setExplains((prev) => ({ ...prev, [i]: { ...prev[i], open: true } }))
      return
    }
    setExplains((prev) => ({ ...prev, [i]: { open: true, status: 'loading' } }))
    fetchExplain(i, err)
  }

  const fromStyle = highlightChanges
    ? {
        color: colors.red,
        textDecoration: 'line-through',
        textDecorationColor: colors.redLine,
      }
    : { color: colors.muted3 }
  const toStyle = highlightChanges ? { color: colors.green, fontWeight: 500 } : {}

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
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
          padding: '15px 20px',
          borderBottom: `1px solid ${colors.borderSoft}`,
        }}
      >
        <span style={{ fontSize: 12, letterSpacing: '0.2em', color: colors.muted4 }}>错误点</span>
        {status === 'done' && (
          <span
            style={{
              fontSize: 12,
              color: colors.muted4,
              background: colors.greenSoft,
              borderRadius: 20,
              padding: '2px 11px',
              letterSpacing: '0.02em',
            }}
          >
            {errors.length} 处
          </span>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {status === 'done' && errors.length > 0 &&
          errors.map((err, i) => {
            const isSelected = i === selectedError
            const ex = explains[i]
            return (
            <div
              key={i}
              ref={isSelected ? selectedRef : undefined}
              className="error-card"
              onClick={() => onSelectError(isSelected ? null : i)}
              style={{
                padding: '16px 20px',
                borderLeft: `3px solid ${isSelected ? colors.green : 'transparent'}`,
                borderBottom: `1px solid ${colors.borderFaint}`,
                cursor: 'pointer',
                background: isSelected ? colors.greenSoft : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: dotColor(err.cat),
                    display: 'inline-block',
                    flex: 'none',
                  }}
                />
                <span style={{ fontSize: 10.5, letterSpacing: '0.16em', color: colors.muted3 }}>
                  {err.cat}
                </span>
              </div>
              <div style={{ fontFamily: fontFamilies.serif, fontSize: 15.5, lineHeight: 1.55 }}>
                <span style={fromStyle}>{err.from}</span>
                <span style={{ color: colors.muted5, padding: '0 8px' }}>→</span>
                <span style={toStyle}>{err.to || '（删除）'}</span>
              </div>
              {showNotes && err.note && (
                <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.7, color: colors.muted3 }}>
                  {err.note}
                </p>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExplain(i, err)
                }}
                style={{
                  marginTop: 10,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 12,
                  color: colors.green,
                  fontFamily: 'inherit',
                }}
              >
                {ex?.open ? '收起详解 ▴' : '详解 ▾'}
              </button>

              {ex?.open && (
                <div style={{ marginTop: 8 }}>
                  {ex.status === 'loading' && (
                    <span style={{ fontSize: 12, color: colors.muted2 }}>正在生成详解……</span>
                  )}
                  {ex.status === 'error' && (
                    <span style={{ fontSize: 12, color: colors.red }}>{ex.message}</span>
                  )}
                  {ex.status === 'done' && ex.data && (
                    <>
                      {ex.data.detail && (
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.75, color: colors.muted4 }}>
                          {ex.data.detail}
                        </p>
                      )}
                      {ex.data.examples.map((item, k) => (
                        <div key={k} style={{ marginTop: 8 }}>
                          <div
                            style={{
                              fontFamily: fontFamilies.serif,
                              fontSize: 13.5,
                              color: colors.inkSoft,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.en}
                          </div>
                          {item.zh && (
                            <div style={{ fontSize: 12, color: colors.muted3, lineHeight: 1.5, marginTop: 2 }}>
                              {item.zh}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            )
          })}

        {status === 'done' && errors.length === 0 && (
          <CenterHint title="没有发现需要修改的地方，写得不错！" />
        )}
        {status === 'idle' && (
          <CenterHint title="写完后点「纠错」，每一处需要修改的地方都会逐条列在这里。" />
        )}
        {status === 'loading' && <CenterHint title="正在分析你的英文……" spinner />}
        {status === 'error' && <CenterHint title="纠错失败，请查看左侧提示或检查设置。" />}
      </div>
    </div>
  )
}

function CenterHint({ title, spinner }: { title: string; spinner?: boolean }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 36px',
        gap: 12,
      }}
    >
      {spinner ? (
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `2px solid ${colors.divider}`,
            borderTopColor: colors.green,
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `1.5px solid ${colors.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.muted5,
            fontSize: 16,
          }}
        >
          ·
        </span>
      )}
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: colors.muted2, maxWidth: 220 }}>
        {title}
      </p>
    </div>
  )
}
