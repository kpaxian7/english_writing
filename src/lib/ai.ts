import type {
  CorrectionError,
  CorrectionResult,
  ErrorExplanation,
  Settings,
  TokenUsage,
} from '../types'
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

interface Usage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface ChatResponse {
  choices?: { message?: { content?: string } }[]
  usage?: Usage
}

// 单次请求（或流式无活动）最长等待时间（毫秒），避免请求挂起时一直卡在「纠错中」。
const REQUEST_TIMEOUT_MS = 60000

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

function validateSettings(settings: Settings): string {
  const baseUrl = normalizeBaseUrl(settings.baseUrl)
  if (!baseUrl) throw new AIError('请先在设置里填写 API 地址（Base URL）。')
  if (!settings.apiKey.trim()) throw new AIError('请先在设置里填写 API Key。')
  if (!settings.model.trim()) throw new AIError('请先在设置里填写模型名称。')
  return baseUrl
}

async function throwResponseError(res: Response): Promise<never> {
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

function extractUsage(usage: Usage | undefined): TokenUsage | undefined {
  if (!usage) return undefined
  const promptTokens = typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : 0
  const completionTokens = typeof usage.completion_tokens === 'number' ? usage.completion_tokens : 0
  const totalTokens =
    typeof usage.total_tokens === 'number' ? usage.total_tokens : promptTokens + completionTokens
  if (!totalTokens) return undefined
  return { promptTokens, completionTokens, totalTokens }
}

// 从（可能尚未闭合的）JSON 文本里增量提取某个顶层字符串字段的当前值，用于流式展示。
function extractPartialString(raw: string, key: string): string | null {
  const keyIdx = raw.indexOf(`"${key}"`)
  if (keyIdx === -1) return null
  let i = keyIdx + key.length + 2
  while (i < raw.length && raw[i] !== '"') i++
  if (raw[i] !== '"') return null
  i++
  let out = ''
  while (i < raw.length) {
    const ch = raw[i]
    if (ch === '\\') {
      const next = raw[i + 1]
      if (next === undefined) break // 转义序列还没传完
      switch (next) {
        case 'n':
          out += '\n'
          break
        case 't':
          out += '\t'
          break
        case 'r':
          out += '\r'
          break
        case 'b':
          out += '\b'
          break
        case 'f':
          out += '\f'
          break
        case '"':
          out += '"'
          break
        case '\\':
          out += '\\'
          break
        case '/':
          out += '/'
          break
        case 'u': {
          const hex = raw.slice(i + 2, i + 6)
          if (hex.length < 4) return out // \uXXXX 还没传完
          out += String.fromCharCode(parseInt(hex, 16))
          i += 4
          break
        }
        default:
          out += next
      }
      i += 2
      continue
    }
    if (ch === '"') return out // 字符串结束
    out += ch
    i++
  }
  return out // 尚未闭合，返回目前已到达的部分
}

// 非流式请求（用于「详解」这类小请求）。
async function requestChat(
  messages: ChatMessage[],
  settings: Settings,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const baseUrl = validateSettings(settings)
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort)
  }

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
      signal: controller.signal,
    })
  } catch (e) {
    if (timedOut) throw new AIError('请求超时（超过 60 秒无响应）。请检查网络或更换端点后重试。')
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new AIError(
      '网络请求失败。可能是 API 地址不可达，或该端点不允许浏览器直连（CORS）。请检查设置或更换端点。',
    )
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }

  if (!res.ok) await throwResponseError(res)
  return res.json()
}

function extractContent(data: ChatResponse): string {
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new AIError('AI 没有返回内容，请重试。')
  return content
}

// 流式请求（用于纠错）：边接收边通过 onDelta 回调累计内容，返回完整内容 + 用量。
// 使用「无活动超时」：每收到一段就重置计时，超过 REQUEST_TIMEOUT_MS 没有新数据才中断。
async function streamChat(
  messages: ChatMessage[],
  settings: Settings,
  signal: AbortSignal | undefined,
  onDelta: (accumulated: string) => void,
): Promise<{ content: string; usage?: Usage }> {
  const baseUrl = validateSettings(settings)
  const controller = new AbortController()
  let timedOut = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const resetTimer = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)
  }
  resetTimer()
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort)
  }
  const cleanup = () => {
    if (timer) clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }

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
        stream: true,
        stream_options: { include_usage: true },
      }),
      signal: controller.signal,
    })
  } catch (e) {
    cleanup()
    if (timedOut) throw new AIError('请求超时（超过 60 秒无响应）。请检查网络或更换端点后重试。')
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new AIError(
      '网络请求失败。可能是 API 地址不可达，或该端点不允许浏览器直连（CORS）。请检查设置或更换端点。',
    )
  }

  if (!res.ok) {
    cleanup()
    await throwResponseError(res)
  }
  if (!res.body) {
    cleanup()
    throw new AIError('AI 没有返回内容，请重试。')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let content = ''
  let usage: Usage | undefined
  let buffer = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      resetTimer()
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // 保留最后一行（可能不完整）
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let json: any
        try {
          json = JSON.parse(payload)
        } catch {
          continue
        }
        const delta = json?.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta) {
          content += delta
          onDelta(content)
        }
        if (json?.usage) usage = json.usage
      }
    }
  } catch (e) {
    if (timedOut) throw new AIError('请求超时（超过 60 秒无响应）。请检查网络或更换端点后重试。')
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new AIError('读取响应流失败，请重试。')
  } finally {
    cleanup()
  }

  if (!content) throw new AIError('AI 没有返回内容，请重试。')
  return { content, usage }
}

// 纠错（流式）：随内容到达通过 onProgress 实时回调纠正后全文，结束后返回完整结构化结果。
export async function correctText(
  text: string,
  settings: Settings,
  opts?: { signal?: AbortSignal; onProgress?: (partialCorrected: string) => void },
): Promise<CorrectionResult> {
  const { content, usage } = await streamChat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(text) },
    ],
    settings,
    opts?.signal,
    (accumulated) => {
      if (opts?.onProgress) opts.onProgress(extractPartialString(accumulated, 'corrected') ?? '')
    },
  )
  return { ...parseResult(content), usage: extractUsage(usage) }
}

// 针对单处修改再问 AI 要一份深入讲解 + 例句（非流式）。
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
