import { useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Editor from './components/Editor'
import CorrectedPanel from './components/CorrectedPanel'
import ErrorList from './components/ErrorList'
import SettingsModal from './components/SettingsModal'
import { correctText, AIError } from './lib/ai'
import { loadPrefs, loadSettings, savePrefs, saveSettings } from './lib/storage'
import { colors, fontFamilies } from './theme'
import type { CorrectionResult, Preferences, Settings } from './types'

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
    try {
      const res = await correctText(text, settings, controller.signal)
      setResult(res)
      setStatus('done')
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus('error')
      setErrorMessage(e instanceof AIError ? e.message : '发生未知错误，请重试。')
    }
  }

  function handleCopy() {
    if (!result) return
    try {
      navigator.clipboard.writeText(result.corrected)
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

  const submitLabel = status === 'loading' ? '纠错中' : '纠错'

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: colors.paper,
        color: colors.ink,
        fontFamily: fontFamilies.sans,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header onOpenSettings={() => setShowSettings(true)} />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 18, padding: '22px 28px' }}>
        {/* 左列：原文 + 按钮 + 已纠正 */}
        <div style={{ flex: 1.55, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Editor
            text={text}
            onChange={setText}
            fontFamily={fontFamily}
            fontSize={fontSize}
            wordCount={wordCount}
          />

          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={status === 'loading'}
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
            errorMessage={errorMessage}
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
    </div>
  )
}
