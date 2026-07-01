import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { loadPrefs } from './lib/storage'

// 渲染前先根据保存的偏好设置主题，避免深色模式下的白屏闪烁。
document.documentElement.dataset.theme = loadPrefs().theme

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
