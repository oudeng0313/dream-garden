# 🌙 梦境花园 Dream Garden

> 基于荣格分析心理学的 AI 梦境疗愈 Web 应用

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)

用户输入梦境描述,通过 **三段式串行 AI 分析管线**(元数据提取 → 现象学还原 → 荣格解读)结合**文生图模型**,将散乱的梦境记忆转化为有疗愈感的解读文本与超现实视觉化配图。

---

## ✨ 截图

![梦境花园主界面](./docs/screenshot-1.png)

> 用户输入梦境后,先生成超现实风格配图,再依次展开"梦境结构 → 现象学还原 → 荣格的低语"三段分析。

---

## 🎯 核心功能

- **三段式 AI 分析管线**:每个 Agent 职责单一、独立调试,共同构成结构化的解读流程
  - **Agent 1 — 元数据提取**:从梦境文本中提取场景、角色、意象、情绪等结构化信息(JSON)
  - **Agent 2 — 现象学还原**:用克制诗意的语言复述梦境,不解释、不评判,还原"心灵图景"
  - **Agent 3 — 荣格解读**:基于荣格分析心理学(原型、阴影、补偿功能、个体化)给出对话式解读
  - **Agent 4 — 梦境视觉化**:LLM 改写梦境为英文绘画 prompt → 文生图模型生成超现实配图
- **本地存档**:所有梦境记录保存在 localStorage,支持回看与删除
- **API Key 安全**:通过 Vite 开发代理在服务端注入,前端零暴露

---

## 🛠 技术栈

| 类别 | 技术 |
|---|---|
| 前端框架 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS v4 |
| LLM 引擎 | Kimi (`moonshot-v1-8k`) |
| 文生图 | 硅基流动 SiliconFlow (`Kwai-Kolors/Kolors`) |
| 部署(开发期) | Cloudflare Tunnel 公网访问 |

---

## 💡 关键技术决策

### 为什么是三段串行,而不是一次长 prompt?

把所有任务塞给单个 prompt(提取 + 还原 + 解读)会让模型输出质量明显下降,尤其在 8K 上下文限制下。**三段串行的优点**:

1. 每段任务边界清晰,prompt 可独立调优
2. 可单独重试失败的某一段,不必从头跑
3. 上一段的结构化输出作为下一段的输入,信息密度更高
4. 用户体验上有"层层展开"的节奏感

### 如何降低"AI 味"?

LLM 默认输出充斥"首先""综上所述""这象征着"等模板化语言。本项目通过几个手段缓解:

- **风格锚定**:system prompt 指定"接近河合隼雄的著作,而非通俗心理学博主"
- **禁用词清单**:显式列出禁止使用的 AI 味词汇
- **Few-shot 示例**:在 system prompt 中嵌入高质量样例输出
- **对话式语气强化**:用"或许""可能在邀请""仿佛"代替断言式表达
- **结尾留白**:每段解读以开放性问题结束,而非总结

### API Key 为什么不能写在前端?

任何前端代码都可以被用户在浏览器开发者工具看到。本项目通过 Vite dev server 的 proxy 配置,将请求转发到上游 API 时**在服务端注入 Authorization header**,前端只调用相对路径如 `/api/kimi`,密钥永远不离开服务端。

### 为什么保留文生图的随机性?

文生图模型对相同 prompt 每次生成不同结果——可以用 `seed` 固定下来,但本项目刻意保留了这种随机性。**梦本身就是流动、模糊、每次回想都不同的**;在工程的可控性和产品的氛围感之间,选择了后者。用户可以重新生成图片,得到对同一个梦的不同视觉诠释。

---

## 🚀 本地运行

### 环境要求
- Node.js 20+
- npm 10+

### 安装

```bash