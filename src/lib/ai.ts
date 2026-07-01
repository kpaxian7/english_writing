import type { CorrectionError, CorrectionResult, ErrorExplanation, Settings } from '../types'
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  EXPLAIN_SYSTEM_PROMPT,
  buildExplainPrompt,
} from './prompt'

// 自定义错误类型，便于在 UI 区分提示。
export class AIError extends Error {}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices?: { message?: { content?: string } }[]
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

// 从模型返回的文本里抽出 JSON 对象（容错处理 ```json 包裹、前后多余文字）。
function extractJson(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return content.slice(start, end + 1)
  }
  return content.trim()
}

function parseResult(content: string): CorrectionResult {
  let data: unknown
  try {
    data = JSON.parse(extractJson(content))
  } catch {
    throw new AIError('AI 返回的内容不是有效的 JSON，请重试或更换模型。')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj?.corrected !== 'string' || !Array.isArray(obj?.errors)) {
    throw new AIError('AI 返回的结构不符合预期，请重试。')
  }
  const errors = (obj.errors as Record<string, unknown>[]).map((e) => ({
    cat: String(e?.cat ?? '其他'),
    from: String(e?.from ?? ''),
    to: String(e?.to ?? ''),
    note: String(e?.note ?? ''),
  }))
  // translation 容错：个别模型可能漏返回，缺失时回退为空字符串，不影响其余结果。
  const translation = typeof obj.translation === 'string' ? obj.translation : ''
  return { corrected: obj.corrected, translation, errors }
}

function parseExplanation(content: string): ErrorExplanation {
  let data: unknown
  try {
    data = JSON.parse(extractJson(content))
  } catch {
    throw new AIError('AI 返回的内容不是有效的 JSON，请重试。')
  }
  const obj = data as Record<string, unknown>
  const detail = typeof obj?.detail === 'string' ? obj.detail : ''
  const rawExamples = Array.isArray(obj?.examples) ? (obj.examples as Record<string, unknown>[]) : []
  const examples = rawExamples.map((e) => ({
    en: String(e?.en ?? ''),
    zh: String(e?.zh ?? ''),
  }))
  if (!detail && examples.length === 0) {
    throw new AIError('AI 返回的结构不符合预期，请重试。')
  }
  return { detail, examples }
}

// 通用请求：向 OpenAI 兼容 /chat/completions 发一次 JSON 模式请求（纯浏览器直连，无后端）。
async function requestChat(
  messages: ChatMessage[],
  settings: Settings,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl)
  if (!baseUrl) throw new AIError('请先在设置里填写 API 地址（Base URL）。')
  if (!settings.apiKey.trim()) throw new AIError('请先在设置里填写 API Key。')
  if (!settings.model.trim()) throw new AIError('请先在设置里填写模型名称。')

  let res: Response
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: settings.model.trim(),
        temperature: 0.2,
        messages,
        response_format: { type: 'json_object' },
      }),
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new AIError(
      '网络请求失败。可能是 API 地址不可达，或该端点不允许浏览器直连（CORS）。请检查设置或更换端点。',
    )
  }

  if (!res.ok) {
    let detail = ''
    try {
      const err = await res.json()
      detail = err?.error?.message || err?.message || ''
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new AIError('鉴权失败（401）：API Key 不正确或已失效。')
    if (res.status === 404)
      throw new AIError('接口不存在（404）：请检查 Base URL 或模型名称是否正确。')
    if (res.status === 429) throw new AIError('请求过于频繁或额度不足（429）。请稍后再试。')
    throw new AIError(`请求失败（${res.status}）${detail ? '：' + detail : ''}`)
  }

  return res.json()
}

function extractContent(data: ChatResponse): string {
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new AIError('AI 没有返回内容，请重试。')
  return content
}

// 纠错：返回纠正后全文 + 中文翻译 + 结构化错误点。
export async function correctText(
  text: string,
  settings: Settings,
  signal?: AbortSignal,
): Promise<CorrectionResult> {
  const data = await requestChat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(text) },
    ],
    settings,
    signal,
  )
  return parseResult(extractContent(data))
}

// 针对单处修改再问 AI 要一份深入讲解 + 例句。
export async function explainError(
  error: CorrectionError,
  context: string,
  settings: Settings,
  signal?: AbortSignal,
): Promise<ErrorExplanation> {
  const data = await requestChat(
    [
      { role: 'system', content: EXPLAIN_SYSTEM_PROMPT },
      { role: 'user', content: buildExplainPrompt(error, context) },
    ],
    settings,
    signal,
  )
  return parseExplanation(extractContent(data))
}
