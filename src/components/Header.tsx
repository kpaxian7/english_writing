import { colors, fontFamilies } from '../theme'

export default function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <header
      style={{
        height: 62,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: colors.green,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: fontFamilies.brand,
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: '0.05em',
            }}
          >
            先写再说
          </span>
        </div>
        <span style={{ fontSize: 11, letterSpacing: '0.34em', color: colors.muted1, paddingLeft: 1 }}>
          英文写作纠错
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ fontSize: 11.5, letterSpacing: '0.06em', color: colors.muted2 }}>
          别怕写错，先把想法写出来
        </span>
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="设置"
          aria-label="设置"
          style={{
            border: `1px solid ${colors.divider}`,
            background: colors.white,
            cursor: 'pointer',
            color: colors.muted4,
            width: 30,
            height: 30,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
          }}
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
