# SeaReport Translator

> 东南亚质检报告 AI 翻译平台 - 专为跨境电商卖家打造

## 核心功能

- 🌏 **7 种东南亚语言**：泰语、越南语、印尼语、马来语、柬埔寨语、缅甸语、老挝语
- 📄 **多格式支持**：PDF / JPG / PNG，最大 50MB
- 🤖 **AI 翻译 + OCR**：Google Cloud Vision + Translation
- 📊 **GB 标准智能映射**：自动识别中国 GB 标准并匹配目标国对应标准
- ⚡ **实时进度推送**：SSE 长连接，断线自动重连
- 📥 **多格式输出**：PDF / Word / 双语对照版

## 技术栈

- **前端**：Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **后端**：Next.js Route Handlers + Prisma + PostgreSQL + Redis
- **AI**：Google Cloud Translation / Vision
- **PDF**：puppeteer / pdf-lib
- **Word**：docx
- **部署**：Docker + Docker Compose

## 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 启动数据库 + Redis + App
docker compose up -d

# 数据库迁移
docker compose exec app npx prisma db push

# 导入种子数据
docker compose exec app npx tsx prisma/seed.ts

# 访问
open http://localhost:3000
```

### 2. 本地开发

```bash
# 安装依赖（跳过 puppeteer 浏览器下载以加速）
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install --legacy-peer-deps

# 启动 PostgreSQL 和 Redis（可用 docker compose 仅启动 db 和 redis）
docker compose up -d db redis

# 配置环境变量
cp .env.local.example .env.local  # 或使用现有的 .env.local

# 数据库迁移
npm run db:push

# 导入种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

## 测试账号

- 管理员：`13800000000` / `admin123456`
- 演示用户：`13900000000` / `demo123456`

## 项目结构

```
.
├── prisma/
│   ├── schema.prisma      # 数据库 schema
│   └── seed.ts            # 种子数据
├── src/
│   ├── app/               # Next.js 路由
│   │   ├── api/           # API 路由
│   │   ├── translate/     # 翻译流程页面
│   │   ├── dashboard/     # 用户中心
│   │   ├── admin/         # 管理后台
│   │   └── (auth)/        # 登录/注册
│   ├── components/        # React 组件
│   │   ├── ui/            # shadcn 基础组件
│   │   └── layout/        # 布局组件
│   └── lib/
│       ├── services/      # 业务服务（OCR/翻译/PDF/Word/SSE/Queue）
│       ├── prisma.ts      # Prisma 客户端
│       ├── redis.ts       # Redis 客户端
│       ├── auth.ts        # 认证
│       └── constants.ts   # 常量定义
├── docker-compose.yml     # Docker 编排
├── Dockerfile             # 应用镜像
└── .env.local             # 环境变量
```

## 开发模式

项目支持 MOCK 模式（`MOCK_TRANSLATION=true` + `MOCK_OCR=true`），无需真实 Google Cloud 凭证即可完整体验流程。

要切换到生产模式：
1. 申请 Google Cloud Translation / Vision API 凭证
2. 设置 `GOOGLE_APPLICATION_CREDENTIALS` 指向凭证文件
3. 设置 `MOCK_TRANSLATION=false` 和 `MOCK_OCR=false`

## 文档

- [PRD 文档](.trae/documents/prd.md)
- [技术架构文档](.trae/documents/tech-architecture.md)
