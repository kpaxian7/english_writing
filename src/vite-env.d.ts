/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 可选：托管/公共体验模式的构建时注入值（详见 src/lib/hosted.ts、README）。
  readonly VITE_DEFAULT_API_KEY?: string
  readonly VITE_DEFAULT_BASE_URL?: string
  readonly VITE_DEFAULT_MODEL?: string
  readonly VITE_DEFAULT_MODELS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
