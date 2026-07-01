import type { HistoryEntry } from '../types'
import { colors, fontFamilies } from '../theme'

interface Props {
  history: HistoryEntry[]
  onRestore: (entry: HistoryEntry) => void
  onClear: () => void
  onClose: () => void
}

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function HistoryModal({ history, onRestore, onClear, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31,30,27,0.32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: colors.paper,
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(31,30,27,0.18)',
          fontFamily: fontFamilies.sans,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 26px 16px',
          }}
        >
          <h2 style={{ fontFamily: fontFamilies.brand, fontSize: 18, fontWeight: 600, color: colors.ink }}>
            纠错历史
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {history.length > 0 && (
              <button
                onClick={onClear}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  color: colors.muted3,
                }}
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="关闭"
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: colors.muted2 }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 14px 14px' }}>
          {history.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: colors.muted2,
                fontSize: 13,
                lineHeight: 1.8,
                padding: '40px 20px',
              }}
            >
              还没有纠错记录。每次纠错成功后会自动保存到这里，最多保留最近 30 条。
            </p>
          ) : (
            history.map((entry) => (
              <button
                key={entry.id}
                className="history-item"
                onClick={() => onRestore(entry)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: `1px solid ${colors.borderSoft}`,
                  borderRadius: 10,
                  background: colors.white,
                  cursor: 'pointer',
                  padding: '12px 14px',
                  margin: '8px 0',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 11.5, color: colors.muted3, letterSpacing: '0.02em' }}>
                    {formatTime(entry.ts)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.muted4,
                      background: colors.greenSoft,
                      borderRadius: 20,
                      padding: '1px 9px',
                    }}
                  >
                    {entry.result.errors.length} 处
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: colors.inkSoft,
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {entry.input}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
