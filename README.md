# GitHub Trending Weekly

![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TS-5-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-4-000?logo=express)
![Deploy](https://img.shields.io/badge/CloudBase-Deployed-blue)

> 全栈 Web 应用 — GitHub Search API 实时获取热门开源项目，Apple 风格暗色主题，日/周/月多维度排行。

---

## 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [已部署地址](#已部署地址)
- [API 文档](#api-文档)
- [配置说明](#配置说明)
- [爬虫架构](#爬虫架构)
- [数据查询](#数据查询)
- [贡献指南](#贡献指南)
- [License](#license)

---

## 项目简介

**GitHub Trending Weekly** 通过 [GitHub Search API](https://docs.github.com/en/rest/search) 自动获取近期高星仓库，提供日榜、周榜、月榜三个时间维度的热门项目排行。前端采用 Apple 风格的暗色主题设计，支持搜索、语言筛选、收藏、数据导出等功能。

### 设计原则

- **数据可靠**：GitHub REST API + Token 认证，避开反爬限制
- **原子一致**：trending 响应内嵌 stats，杜绝数据不同步
- **周期独立**：daily / weekly / monthly 各自缓存，互不覆盖
- **优雅降级**：API 不可达时自动回退至内置示例数据

---

## 核心功能

| 功能区 | 功能 | 说明 |
|--------|------|------|
| 🔄 **数据源** | GitHub Search API | 搜索近 1/7/30 天创建的高星仓库，Token 认证提升速率 |
| 📅 **多维排行** | 日榜 / 周榜 / 月榜 | Tab 切换，各自独立缓存，自动过期刷新 |
| 🔍 **搜索过滤** | 关键词 + 语言下拉 | 按项目名、描述、Owner 实时过滤 |
| 🌗 **主题切换** | 暗色 / 亮色 | CSS 变量驱动的双主题，一键切换 |
| ⭐ **收藏** | localStorage 持久化 | 点击书签图标收藏，独立 Tab 查看 |
| 📥 **导出** | CSV 下载 | 一键导出当前视图数据（UTF-8 BOM） |
| 📊 **可视化** | Recharts 条形图 | Top 8 编程语言分布 |
| 📱 **响应式** | 手机 / 平板 / 桌面 | Tailwind 断点全适配 |
| 🛡️ **容错** | 并发锁 + 三级回退 | 实时抓取 → 缓存 → 内置 fallback |
| ⬆️ **导航** | 回到顶部 | 滚动超过 400px 自动显示 |

---

## 技术栈

### 后端 (server/)

| 依赖 | 用途 |
|------|------|
| [Express 4](https://expressjs.com) | HTTP 框架，4 个 RESTful 端点 |
| [Axios](https://axios-http.com) | 调用 GitHub Search API |
| [node-cron](https://github.com/node-cron/node-cron) | 每小时定时抓取 |

### 前端 (client/)

| 依赖 | 用途 |
|------|------|
| [React 18](https://react.dev) | UI 框架 |
| [TypeScript 5](https://www.typescriptlang.org) | 类型系统 |
| [Vite 5](https://vitejs.dev) | 构建工具 |
| [Tailwind CSS 3](https://tailwindcss.com) | 原子化样式 |
| [shadcn/ui](https://ui.shadcn.com) | UI 组件（Button/Card/Badge/Skeleton/Tabs/Table） |
| [Recharts](https://recharts.org) | 图表库 |
| [Lucide React](https://lucide.dev) | 图标库 |
| [Radix Tabs](https://www.radix-ui.com/primitives) | 无障碍 Tab 组件 |

---

## 项目结构

```
github-trending/
├── server/                            # 后端服务
│   ├── index.js                       # Express 入口（API 路由 + 并发锁 + 定时任务）
│   ├── scraper.js                     # GitHub Search API 爬虫（Token 认证）
│   ├── cache.js                       # Period-aware 文件缓存（3 周期独立 TTL）
│   ├── fallback.js                    # 内置回退数据（17 个项目）
│   ├── query-data.js                  # 数据查询脚本（查看缓存状态）
│   ├── cache_data.json                # 持久化缓存文件
│   ├── Dockerfile                     # CloudRun 容器构建
│   └── package.json
├── client/                            # 前端应用
│   ├── src/
│   │   ├── App.tsx                    # 主入口（所有状态 + UI 连接）
│   │   ├── main.tsx                   # ReactDOM 挂载 + ErrorBoundary
│   │   ├── index.css                  # 全局样式 + CSS 变量 + Tailwind layer
│   │   ├── lib/
│   │   │   ├── utils.ts               # cn() / formatNumber() / formatTimeAgo()
│   │   │   └── constants.ts           # RANK_COLORS / getLanguageColor()
│   │   ├── types/
│   │   │   └── index.ts               # TrendingProject / TrendingStats / LanguageData 等
│   │   ├── hooks/
│   │   │   ├── useTrending.ts         # 数据获取 + period 切换 + forceRefresh
│   │   │   └── useBookmarks.ts        # localStorage 收藏管理
│   │   └── components/
│   │       ├── Header.tsx             # 玻璃态导航 + 刷新按钮
│   │       ├── StatsOverview.tsx       # 统计卡片 + 语言分布图
│   │       ├── ProjectCard.tsx        # 网格卡片（排名徽章 + 书签按钮）
│   │       ├── Leaderboard.tsx        # 表格排行榜
│   │       ├── LoadingSkeleton.tsx    # 骨架屏（复用 Skeleton 组件）
│   │       ├── ErrorState.tsx         # 错误提示 + 重试
│   │       ├── ErrorBoundary.tsx      # React 错误边界
│   │       ├── ScrollToTop.tsx        # 回到顶部按钮
│   │       ├── Footer.tsx             # 页脚
│   │       └── ui/                    # shadcn 基础组件
│   │           ├── button.tsx / card.tsx / badge.tsx
│   │           ├── skeleton.tsx / table.tsx / tabs.tsx
│   ├── vite.config.ts / tailwind.config.js
│   └── package.json
├── package.json                       # 根（concurrently 并行启动）
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 1. 安装依赖

```bash
cd server && npm install
cd ../client && npm install
```

### 2. 配置 GitHub Token（可选）

```bash
# Linux / macOS
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Windows PowerShell
$env:GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

不配置 Token 也可以运行，但 API 速率限制为 60 次/小时。

### 3. 启动开发服务器

```bash
# 终端 1：后端 (localhost:3001)
cd server && node index.js

# 终端 2：前端 (localhost:3000)
cd client && npx vite --host
```

前端通过 Vite proxy 将 `/api` 请求转发到后端。

### 4. 一键启动（可选）

```bash
npm install concurrently
npm run dev
```

---

## 已部署地址

| 服务 | URL |
|------|-----|
| 🌐 **前端页面** | `https://github-project-d5gs0r3dnd1e0d244-1436658920.tcloudbaseapp.com/` |
| 🔗 **后端 API** | `https://github-trending-api-261916-9-1436658920.sh.run.tcloudbase.com` |

### CloudBase 资源

| 资源 | 环境 ID | 地域 | 配置 |
|------|---------|------|------|
| 环境 | `github-project-d5gs0r3dnd1e0d244` | ap-shanghai | 体验版 |
| 后端 | CloudRun 容器 | — | 0.5 核 / 1GB / 1~5 实例 |
| 前端 | 静态网站托管 | — | CDN 加速 |

---

## API 文档

### Base URL

```
生产: https://github-trending-api-261916-9-1436658920.sh.run.tcloudbase.com
本地: http://localhost:3001
```

所有响应均为 `Content-Type: application/json`，CORS 已启用。

---

### `GET /api/trending`

获取热门项目列表，响应内嵌统计数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `period` | `string` | `"weekly"` | `daily` / `weekly` / `monthly` |
| `force` | `string` | `"false"` | `"true"` 时强制实时抓取 |

**示例请求**

```bash
curl "https://github-trending-api-...com/api/trending?period=weekly&force=true"
```

**响应字段**

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "owner": "perplexityai",
      "name": "bumblebee",
      "fullName": "perplexityai/bumblebee",
      "url": "https://github.com/perplexityai/bumblebee",
      "description": "Read-only developer endpoint scanner...",
      "language": "Go",
      "totalStars": 2270,
      "forks": 85,
      "starsThisPeriod": 227,
      "contributors": []
    }
  ],
  "stats": {
    "totalProjects": 25,
    "totalStarsThisWeek": 1662,
    "avgStarsPerProject": 66,
    "topLanguage": "Go",
    "topLanguageCount": 5,
    "languageDistribution": { "Go": 5, "JavaScript": 3 }
  },
  "cached": true,
  "timestamp": 1779692363311,
  "source": "startup",
  "age": 37497,
  "period": "weekly"
}
```

---

### `GET /api/trending/stats`

聚合统计数据（独立端点，向后兼容）。

```bash
curl "https://...com/api/trending/stats?period=weekly"
```

---

### `GET /api/trending/languages`

编程语言分布列表。

```bash
curl "https://...com/api/trending/languages?period=weekly"
```

```json
{
  "success": true,
  "languages": [
    { "name": "Go", "count": 5 },
    { "name": "JavaScript", "count": 3 }
  ]
}
```

---

### `GET /api/health`

健康检查。

```bash
curl "https://...com/api/health"
```

```json
{
  "status": "ok",
  "period": "weekly",
  "projectsCount": 25,
  "lastUpdated": 1779692363311,
  "cacheAge": 347124
}
```

---

## 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3001` | 服务端口（CloudRun 自动注入） |
| `GITHUB_TOKEN` | — | GitHub Personal Access Token，提升 API 速率到 5000 次/小时 |

### Token 创建步骤

1. 访问 [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 勾选 `public_repo` 权限
4. 复制 Token 并设置到环境变量

### CloudBase 环境变量

在 CloudRun 控制台 → 服务配置 → 环境变量中添加 `GITHUB_TOKEN`。

### 缓存行为

```
TTL: 1 小时
结构: { entries: { daily: {...}, weekly: {...}, monthly: {...} } }
过期策略: 每个周期独立 TTL
回退链: 实时抓取 → period 缓存 → 跨周期缓存 → fallback.js
```

---

## 爬虫架构

### 数据流

```
GitHub Search API
    │  GET /search/repositories
    │  ?q=created:>YYYY-MM-DD&sort=stars&order=desc&per_page=25
    │  Authorization: Bearer <GITHUB_TOKEN>
    ▼
scraper.js  ──→  parse API response  ──→  25 个 TrendingProject 对象
    │
    ▼
scrapeWithLock()  ──→  并发锁（同一时间仅一个抓取任务）
    │
    ▼
cache.js  ──→  setCache(data, source, period)
    │  ┌─ daily:   { data, timestamp, source }
    │  ├─ weekly:  { data, timestamp, source }
    │  └─ monthly: { data, timestamp, source }
    ▼
index.js API response  ──→  内嵌 stats（computeStats）
    │
    ▼
React 前端  ──→  useTrending hook  ──→  state 更新 ──→ UI 渲染
```

### 定时任务

```
cron: 0 * * * * (每小时整点)
遍历 daily / weekly / monthly 三个周期逐一抓取
```

---

## 数据查询

使用内置脚本查看缓存数据：

```bash
cd server
node query-data.js
```

输出示例：

```
📂 缓存格式: Period-aware (v2)

══════════════════════════════════════════════════════════════
  📅 WEEKLY  ·  25 条记录
  🕐 更新时间: 2026/5/25 15:00:12
  📤 数据来源: startup
──────────────────────────────────────────────────────────────
  展示前 8 条:

  # 1  perplexityai/bumblebee
      📖 Read-only developer endpoint scanner...
      💻 Go  ⭐ 2.3K  🔺 +227  🍴 85
      🔗 https://github.com/perplexityai/bumblebee

  ... (共 25 条)

══════════════════════════════════════════════════════════════
  📊 总计: 25 条  |  3 个周期
══════════════════════════════════════════════════════════════

🌐 语言分布汇总:
  Go              5 条
  JavaScript      3 条
  ...
```

---

## 贡献指南

### 分支规范

- `main` — 稳定版本
- `feat/*` — 新功能
- `fix/*` — Bug 修复

### 提交信息

```
feat: 添加语言筛选功能
fix: 修复 period 切换不生效
refactor: 缓存改为 period 感知
docs: 更新 README 部署文档
```

### 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/my-feature`
3. 提交代码：`git commit -m "feat: xxx"`
4. 推送分支：`git push origin feat/my-feature`
5. 创建 Pull Request

### 代码规范

- TypeScript 严格模式，禁止 `any`
- 组件使用 `React.memo` + `useMemo` 优化
- API 响应必须包含 `success` 字段
- 缓存操作需指定 `period` 参数

---

## License

MIT © 2026

--- 

> 数据来源于 GitHub Search API，项目与 GitHub Inc. 无关。
