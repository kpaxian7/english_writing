// 托管 / 公共体验模式：由构建时环境变量注入默认连接信息。
//
// 设置了 VITE_DEFAULT_API_KEY 即进入「托管模式」——设置里隐藏 Key / Base URL 输入，
// 用户只能从 VITE_DEFAULT_MODELS 白名单里选模型，请求走注入的 Key（你自己的）。
// 不设置则为开源默认「自带 Key」模式（用户自行填写，Key 不经过任何人）。
//
// ⚠️ 纯前端无后端：构建时 Key 会被内联进 JS，部署后可被访客从浏览器提取。
//    托管模式请务必使用「限额 / 预充值」的专用 Key（如 OpenRouter 限额 Key），把最坏损失封顶。

const rawKey = (import.meta.env.VITE_DEFAULT_API_KEY ?? '').trim()
const rawBaseUrl = (import.meta.env.VITE_DEFAULT_BASE_URL ?? '').trim()
const rawModel = (import.meta.env.VITE_DEFAULT_MODEL ?? '').trim()
const rawModels = (import.meta.env.VITE_DEFAULT_MODELS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const IS_HOSTED = rawKey !== ''
export const HOSTED_KEY = rawKey
export const HOSTED_BASE_URL = rawBaseUrl
// 允许用户选择的模型白名单；未显式提供则退回单个 VITE_DEFAULT_MODEL。
export const HOSTED_MODELS = rawModels.length ? rawModels : rawModel ? [rawModel] : []
export const HOSTED_MODEL = rawModel || HOSTED_MODELS[0] || ''
