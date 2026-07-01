import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Editor from './components/Editor'
import CorrectedPanel from './components/CorrectedPanel'
import ErrorList from './components/ErrorList'
import SettingsModal from './components/SettingsModal'
import HistoryModal from './components/HistoryModal'
import { correctText, AIError } from './lib/ai'
import { loadHistory, loadPrefs, loadSettings, savePrefs, saveSettings, saveHistory } from './lib/storage'
import { colors, fontFamilies } from './theme'
import type { CorrectionResult, HistoryEntry, Preferences, Settings } from './types'

type Status = 'idle' | 'loading' | 'done' | 'error'

const SAMPLE =
  'Yesterday I go to the supermarket want to buy some fruit. But when I arrive there, I find it already close. I very disappointed because I have not eat anything since morning. So I decide to go to a restaurant near my home. The food is very delicious and the price is also very cheap. I think I will go there again next time.'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs)
  const [text, setText] = useState(SAMPLE)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<CorrectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [copied, setCopied] = useState(false)
  const [selectedError, setSelectedError] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mono = prefs.writingFont === '等宽'
  const fontFamily = mono ? fontFamilies.mono : fontFamilies.serif
  const fontSize = mono ? '15.5px' : '17px'

  const wordCount = useMemo(() => (text.match(/[A-Za-z0-9'’\-]+/g) || []).length, [text])

  async function handleSubmit() {
    if (status === 'loading') return
    if (!text.trim()) return
    if (!settings.apiKey.trim() || !settings.baseUrl.trim() || !settings.model.trim()) {
      setStatus('error')
      setErrorMessage('请先在右上角「设置」中填写 API 地址、Key 和模型。')
      setShowSettings(true)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setErrorMessage('')
    setSelectedError(null)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setCopied(false)
    try {
      const res = await correctText(text, settings, controller.signal)
      setResult(res)
      setStatus('done')
      const entry: HistoryEntry = { id: String(Date.now()), ts: Date.now(), input: text, result: res }
      const nextHistory = [entry, ...history].slice(0, 30)
      setHistory(nextHistory)
      saveHistory(nextHistory)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus('error')
      setErrorMessage(e instanceof AIError ? e.message : '发生未知错误，请重试。')
    }
  }

  function handleCopy() {
    if (!result) return
    // 复制范围跟随「中文」开关：开着且有译文时连中文一起复制。
    const withTranslation = prefs.showTranslation && result.translation
    const text = withTranslation ? `${result.corrected}\n\n${result.translation}` : result.corrected
    try {
      navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1800)
  }

  function handleSaveSettings(s: Settings, p: Preferences) {
    setSettings(s)
    setPrefs(p)
    saveSettings(s)
    savePrefs(p)
    setShowSettings(false)
  }

  function handleToggleTranslation() {
    const next = { ...prefs, showTranslation: !prefs.showTranslation }
    setPrefs(next)
    savePrefs(next)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme
  }, [prefs.theme])

  function handleToggleTheme() {
    const next = { ...prefs, theme: prefs.theme === 'dark' ? ('light' as const) : ('dark' as const) }
    setPrefs(next)
    savePrefs(next)
  }

  function handleRestore(entry: HistoryEntry) {
    setText(entry.input)
    setResult(entry.result)
    setStatus('done')
    setSelectedError(null)
    setErrorMessage('')
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setCopied(false)
    setShowHistory(false)
  }

  function handleClearHistory() {
    setHistory([])
    saveHistory([])
  }

  const submitLabel = status === 'loading' ? '纠错中' : '纠错'

  return (
    <div
      className="app-root"
      style={{
        background: colors.paper,
        color: colors.ink,
        fontFamily: fontFamilies.sans,
      }}
    >
      <Header
        theme={prefs.theme}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {!settings.apiKey.trim() && (
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 20px',
            background: colors.greenSoft,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontSize: 12.5, lineHeight: 1.6, color: colors.greenDark }}>
            👋 还没配置 API Key —— 填入任意 OpenAI 兼容服务的地址、Key 和模型即可开始纠错，Key 只存在你自己的浏览器里。
          </span>
          <button
            className="btn-primary"
            onClick={() => setShowSettings(true)}
            style={{
              flex: 'none',
              border: 'none',
              background: colors.green,
              color: colors.paper,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            打开设置
          </button>
        </div>
      )}

      <div className="app-main">
        {/* 左列：原文 + 按钮 + 已纠正 */}
        <div className="app-col-left">
          <Editor
            text={text}
            onChange={setText}
            onSubmit={handleSubmit}
            fontFamily={fontFamily}
            fontSize={fontSize}
            wordCount={wordCount}
          />

          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={status === 'loading'}
              title="⌘ / Ctrl + Enter"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: 'none',
                cursor: status === 'loading' ? 'default' : 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 500,
                color: colors.paper,
                background: colors.green,
                padding: '10px 24px',
                borderRadius: 9,
                letterSpacing: '0.05em',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {submitLabel}
            </button>
          </div>

          <CorrectedPanel
            status={status}
            correctedText={result?.corrected ?? ''}
            errors={result?.errors ?? []}
            selectedError={selectedError}
            onSelectError={setSelectedError}
            highlightChanges={prefs.highlightChanges}
            translation={result?.translation ?? ''}
            showTranslation={prefs.showTranslation}
            onToggleTranslation={handleToggleTranslation}
            usage={result?.usage}
            errorMessage={errorMessage}
            onRetry={handleSubmit}
            fontFamily={fontFamily}
            fontSize={fontSize}
            copied={copied}
            onCopy={handleCopy}
          />
        </div>

        {/* 右列：错误点 */}
        <ErrorList
          status={status}
          errors={result?.errors ?? []}
          highlightChanges={prefs.highlightChanges}
          showNotes={prefs.showNotes}
          selectedError={selectedError}
          onSelectError={setSelectedError}
          settings={settings}
          contextText={result?.corrected ?? ''}
        />
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          prefs={prefs}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          history={history}
          onRestore={handleRestore}
          onClear={handleClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
