import { colors, fontFamilies } from '../theme'

export default function Header({
  onOpenHistory,
  onOpenSettings,
}: {
  onOpenHistory: () => void
  onOpenSettings: () => void
}) {
  return (
    <header
      className="app-header"
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
        <span className="header-tagline" style={{ fontSize: 11.5, letterSpacing: '0.06em', color: colors.muted2 }}>
          别怕写错，先把想法写出来
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="icon-btn"
            onClick={onOpenHistory}
            title="纠错历史"
            aria-label="纠错历史"
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
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </button>
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
          <a
            className="icon-btn"
            href="https://github.com/kpaxian7/english_writing"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 仓库"
            aria-label="GitHub 仓库"
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
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
