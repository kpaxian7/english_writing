import { useState } from 'react'
import type { Preferences, Settings, WritingFont } from '../types'
import { colors, fontFamilies } from '../theme'

interface Props {
  settings: Settings
  prefs: Preferences
  onSave: (s: Settings, p: Preferences) => void
  onClose: () => void
}

// 常见 OpenAI 兼容服务商预设，方便一键填入。
const PRESETS: { label: string; baseUrl: string; model: string }[] = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { label: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3' },
]

const labelStyle = {
  display: 'block',
  fontSize: 12,
  letterSpacing: '0.04em',
  color: colors.muted4,
  marginBottom: 6,
}
const inputStyle = {
  width: '100%',
  border: `1px solid ${colors.divider}`,
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13.5,
  fontFamily: fontFamilies.sans,
  color: colors.ink,
  outline: 'none',
  background: colors.white,
}

export default function SettingsModal({ settings, prefs, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [p, setP] = useState<Preferences>(prefs)
  const [showKey, setShowKey] = useState(false)

  return (
    <div
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
        style={{
          width: 'min(520px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: colors.paper,
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(31,30,27,0.18)',
          padding: '26px 28px',
          fontFamily: fontFamilies.sans,
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontFamily: fontFamilies.brand, fontSize: 18, fontWeight: 600, color: colors.ink }}>
            设置
          </h2>
        </div>
        <p style={{ fontSize: 12, color: colors.muted3, marginBottom: 20, lineHeight: 1.7 }}>
          填写任意 OpenAI 兼容服务的连接信息。Key 只保存在你自己的浏览器里，不会上传到任何服务器。
        </p>

        {/* 服务商预设 */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle as React.CSSProperties}>快速填入</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className="btn-ghost"
                onClick={() => setDraft({ ...draft, baseUrl: preset.baseUrl, model: preset.model })}
                style={{
                  border: `1px solid ${colors.divider}`,
                  background: colors.white,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: colors.muted4,
                  padding: '5px 12px',
                  borderRadius: 20,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="API 地址（Base URL）">
          <input
            style={inputStyle as React.CSSProperties}
            value={draft.baseUrl}
            onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
            placeholder="https://api.deepseek.com/v1"
            spellCheck={false}
          />
        </Field>

        <Field label="API Key">
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 56 } as React.CSSProperties}
              type={showKey ? 'text' : 'password'}
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-..."
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: colors.muted3,
              }}
            >
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
        </Field>

        <Field label="模型名称">
          <input
            style={inputStyle as React.CSSProperties}
            value={draft.model}
            onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            placeholder="deepseek-chat"
            spellCheck={false}
          />
        </Field>

        <Field label={`采样温度：${draft.temperature.toFixed(1)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={draft.temperature}
            onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })}
            style={{ width: '100%', accentColor: colors.green, cursor: 'pointer' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: colors.muted3,
              marginTop: 4,
            }}
          >
            <span>更稳定 · 0</span>
            <span>更多样 · 1</span>
          </div>
        </Field>

        <div style={{ height: 1, background: colors.border, margin: '20px 0' }} />

        {/* 界面偏好 */}
        <Field label="排版字体">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['衬线', '等宽'] as WritingFont[]).map((f) => (
              <button
                key={f}
                onClick={() => setP({ ...p, writingFont: f })}
                style={{
                  flex: 1,
                  border: `1px solid ${p.writingFont === f ? colors.green : colors.divider}`,
                  background: p.writingFont === f ? colors.greenSoft : colors.white,
                  color: p.writingFont === f ? colors.green : colors.muted4,
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '8px 0',
                  borderRadius: 8,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Toggle
          label="高亮改动（原词划掉、改词标绿）"
          checked={p.highlightChanges}
          onChange={(v) => setP({ ...p, highlightChanges: v })}
        />
        <Toggle
          label="显示中文说明"
          checked={p.showNotes}
          onChange={(v) => setP({ ...p, showNotes: v })}
        />
        <Toggle
          label="显示中文含义（纠正后附整段中文翻译）"
          checked={p.showTranslation}
          onChange={(v) => setP({ ...p, showTranslation: v })}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${colors.divider}`,
              background: colors.white,
              cursor: 'pointer',
              fontSize: 13,
              color: colors.muted4,
              padding: '9px 18px',
              borderRadius: 9,
            }}
          >
            取消
          </button>
          <button
            className="btn-primary"
            onClick={() => onSave(draft, p)}
            style={{
              border: 'none',
              background: colors.green,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: colors.paper,
              padding: '9px 20px',
              borderRadius: 9,
              letterSpacing: '0.05em',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={labelStyle as React.CSSProperties}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: '8px 0',
      }}
    >
      <span style={{ fontSize: 13, color: colors.muted4 }}>{label}</span>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 22,
          background: checked ? colors.green : colors.divider,
          position: 'relative',
          transition: 'background 0.15s ease',
          flex: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: colors.white,
            transition: 'left 0.15s ease',
          }}
        />
      </span>
    </label>
  )
}
