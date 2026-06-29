# 先写再说 · 英文写作纠错

> 别怕写错，先把想法写出来。

一个**纯前端**的英文写作纠错工具，面向中文母语者。你写下英文（拼错、语序乱、时态错都没关系），AI 给出纠正后的全文，并在右侧逐条列出每一处修改和**中文讲解**。

**自带 API Key**：填入任意 OpenAI 兼容服务的连接信息即可使用。Key 只保存在你自己的浏览器里，不经过任何服务器——**没有后端**。

![screenshot](docs/screenshot.png)

## 特点

- 🪶 **无需后端**：编译后是一堆静态文件，浏览器直接调用 AI 接口。
- 🔑 **自带 Key**：支持 DeepSeek、OpenAI、Moonshot/Kimi、SiliconFlow 等任意 OpenAI 兼容端点。
- 📝 **结构化纠错**：纠正全文 + 分类错误点（时态/句式/用词/缺词…）+ 中文说明。
- 🌐 **中文对照**：纠正后全文附整段中文意译，帮你确认表达的意思，可一键开关。
- 🎨 **可调排版**：衬线 / 等宽字体切换、是否高亮改动、是否显示讲解、是否显示中文对照。
- 🔒 **隐私友好**：API Key 仅存于浏览器 `localStorage`，不上传。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地开发
npm run dev
# 打开终端里显示的地址（默认 http://localhost:5173）

# 3. 在页面右上角「设置」里填写：
#    - API 地址（Base URL），如 https://api.deepseek.com/v1
#    - API Key
#    - 模型名称，如 deepseek-chat
# 然后写下英文，点「开始纠错」即可。
```

## 部署

构建为静态文件，可托管到任意静态服务器 / GitHub Pages / Vercel / Netlify：

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建产物
```

部署后用户在自己的浏览器里填入各自的 Key 即可，**你不会接触到任何用户的 Key，也不承担 API 费用**。

## 关于浏览器直连（CORS）

因为没有后端，浏览器会**直接**向 AI 服务商发请求，要求该端点允许跨域（返回正确的 CORS 头）：

| 服务商 | 浏览器直连 |
| --- | --- |
| DeepSeek | ✅ |
| OpenAI | ✅ |
| Moonshot / Kimi | ✅ |
| SiliconFlow | ✅ |
| 个别自建 / 小众端点 | ⚠️ 可能不返回 CORS 头，会被浏览器拦截 |

若你的端点不支持 CORS，可自行在其前面挂一个反向代理转发请求；对绝大多数主流服务商而言无需任何额外配置。

## 技术栈

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- 无运行时依赖后端，接口走标准 OpenAI `/chat/completions`

## 目录结构

```
src/
  App.tsx               主界面与状态编排
  components/           Header / Editor / CorrectedPanel / ErrorList / SettingsModal
  lib/
    ai.ts               调用 OpenAI 兼容接口
    prompt.ts           纠错的 system / user prompt
    storage.ts          设置与偏好的本地存储
  theme.ts              配色、字体、分类颜色
  types.ts              类型定义
```

## License

[MIT](./LICENSE)
