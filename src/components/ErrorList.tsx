import type { CorrectionError } from '../types'
import { colors, dotColor, fontFamilies } from '../theme'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  status: Status
  errors: CorrectionError[]
  highlightChanges: boolean
  showNotes: boolean
}

export default function ErrorList({ status, errors, highlightChanges, showNotes }: Props) {
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
          errors.map((err, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.borderFaint}` }}>
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
            </div>
          ))}

        {status === 'done' && errors.length === 0 && (
          <CenterHint title="没有发现需要修改的地方，写得不错！" />
        )}
        {status === 'idle' && (
          <CenterHint title="写完后点「开始纠错」，每一处需要修改的地方都会逐条列在这里。" />
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
