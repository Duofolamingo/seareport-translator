# SeaReport Translator - 技术架构文档

## 1. 架构设计

```mermaid
flowchart TB
    subgraph 前端
        A[Next.js 15 App Router]
        A1[Tailwind + shadcn/ui]
        A2[React Context + SWR]
        A3[react-dropzone]
    end

    subgraph 后端
        B[Next.js API Routes]
        B1[NextAuth.js]
        B2[Prisma ORM]
        B3[ioredis Queue]
        B4[Services 层]
    end

    subgraph 数据
        C1[(PostgreSQL 15)]
        C2[(Redis 7)]
        C3[本地文件 / 阿里云 OSS]
    end

    subgraph 外部服务
        D1[Google Cloud Translation]
        D2[Google Cloud Vision OCR]
        D3[阿里云机器翻译 备用]
        D4[阿里云短信]
    end

    A --> B
    A --> A1
    A --> A2
    A --> A3
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    B2 --> C1
    B3 --> C2
    B --> C3
    B4 --> D1
    B4 --> D2
    B4 --> D3
    B1 --> D4
```

## 2. 技术栈

| 层 | 选型 | 用途 |
|------|------|------|
| 前端框架 | Next.js 15 (App Router) | SSR + RSC + 路由 |
| 语言 | TypeScript | 类型安全（禁用 any） |
| 样式 | Tailwind CSS + shadcn/ui | 设计系统 |
| 状态 | React Context + SWR | 全局状态 + 数据获取 |
| 文件上传 | react-dropzone | 拖拽上传 |
| 后端 | Next.js Route Handlers | API 路由 |
| ORM | Prisma | 数据库访问 |
| 数据库 | PostgreSQL 15 | 主数据存储 |
| 缓存/队列 | Redis 7 (ioredis) | 任务队列 + 缓存 |
| 认证 | NextAuth.js | 手机号/密码登录 |
| 翻译 | Google Cloud Translation | 主翻译引擎 |
| 翻译（备） | 阿里云机器翻译 | 备用翻译 |
| OCR | Google Cloud Vision | 图片/PDF 文本提取 |
| PDF 解析 | pdf-parse | 文本提取 |
| PDF 转图 | pdf2pic | 扫描件 OCR |
| PDF 生成 | puppeteer | HTML → PDF |
| Word 生成 | docx | 生成 .docx 文件 |
| PDF 操作 | pdf-lib | PDF 合并 |
| 验证 | zod | API 入参校验 |
| 字体 | Noto Sans Thai/Khmer/Myanmar | 东南亚文字 |
| 部署 | Docker + Docker Compose | 容器化 |

## 3. 路由定义

### 3.1 页面路由

| 路由 | 用途 | 鉴权 |
|------|------|------|
| / | 首页 | 公开 |
| /translate | 翻译中心 | 公开（建议登录） |
| /translate/progress/[id] | 翻译进度 | 需登录 |
| /translate/result/[id] | 翻译结果 | 需登录 |
| /standards | 标准查询 | 公开 |
| /pricing | 定价页 | 公开 |
| /login | 登录页 | 公开 |
| /dashboard | 工作台 | USER |
| /dashboard/orders | 订单列表 | USER |
| /dashboard/orders/[id] | 订单详情 | USER |
| /dashboard/settings | 账户设置 | USER |
| /admin | 管理首页 | ADMIN |
| /admin/users | 用户管理 | ADMIN |
| /admin/orders | 订单管理 | ADMIN |
| /admin/standards | 标准库 | ADMIN |
| /admin/terms | 术语库 | ADMIN |
| /admin/settings | 系统设置 | ADMIN |

### 3.2 API 路由

| 路由 | 方法 | 用途 |
|------|------|------|
| /api/auth/login | POST | 登录（密码/验证码） |
| /api/auth/verify-code | POST | 发送验证码 |
| /api/auth/logout | POST | 登出 |
| /api/auth/me | GET | 当前用户信息 |
| /api/upload | POST | 文件上传（50MB 限） |
| /api/orders | POST | 创建翻译订单 |
| /api/orders | GET | 订单列表 |
| /api/orders/[id] | GET | 订单详情 |
| /api/orders/[id] | DELETE | 删除订单 |
| /api/orders/[id]/progress | GET | SSE 实时进度 |
| /api/orders/[id]/retry | POST | 失败重试 |
| /api/standards | GET | 标准查询 |
| /api/standards/categories | GET | 品类列表 |
| /api/terms | GET | 术语查询 |
| /api/admin/users | GET | 用户列表（ADMIN） |
| /api/admin/orders | GET | 全部订单（ADMIN） |
| /api/admin/standards | POST | 新增标准（ADMIN） |
| /api/admin/standards/[id] | PUT | 修改标准（ADMIN） |
| /api/admin/standards/[id] | DELETE | 删除标准（ADMIN） |
| /api/admin/terms | POST | 新增术语（ADMIN） |
| /api/admin/terms/[id] | PUT | 修改术语（ADMIN） |
| /api/admin/terms/[id] | DELETE | 删除术语（ADMIN） |
| /api/download/[file] | GET | 文件下载（签名校验） |

## 4. 数据模型

### 4.1 ER 图

```mermaid
erDiagram
    User ||--o{ Order : creates
    User ||--o{ Session : has
    User ||--o{ Subscription : subscribes
    Order ||--|| StandardMapping : "references via JSON"
    Term }o--o{ Order : "used in"
    StandardMapping {
        string id PK
        string gbStandard
        string gbName
        enum targetCountry
        string targetStandard
        string targetName
        enum productCategory
        string notes
    }
    Term {
        string id PK
        string chinese
        string thai
        string vietnamese
        string indonesian
        string malay
        string khmer
        string burmese
        string lao
        enum category
    }
    Order {
        string id PK
        string userId FK
        string fileName
        string fileUrl
        enum fileType
        int pageCount
        enum targetLang
        enum outputFormat
        enum status
        string translatedUrl
        string wordUrl
        string comparisonUrl
        json standardSheet
        text ocrText
        text translatedText
        string errorMessage
    }
    User {
        string id PK
        string phone UK
        string name
        string company
        enum role
    }
```

### 4.2 关键 DDL（Prisma Schema 摘要）

```prisma
model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  name      String?
  company   String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  orders    Order[]
  sessions  Session[]
}

model Order {
  id             String      @id @default(cuid())
  userId         String
  fileName       String
  fileUrl        String
  fileType       FileType
  pageCount      Int?
  targetLang     TargetLang
  outputFormat   OutputFormat @default(PDF)
  status         OrderStatus  @default(PENDING)
  reportType     ReportType?
  translatedUrl  String?
  wordUrl        String?
  comparisonUrl  String?
  standardSheet  Json?
  ocrText        String?     @db.Text
  translatedText String?     @db.Text
  errorMessage   String?
  createdAt      DateTime    @default(now())
  completedAt    DateTime?
  user           User        @relation(fields: [userId], references: [id])
}

model StandardMapping {
  id              String   @id @default(cuid())
  gbStandard      String
  gbName          String
  targetCountry   Country
  targetStandard  String
  targetName      String
  productCategory ReportType
  notes           String?
  @@unique([gbStandard, targetCountry, productCategory])
}

model Term {
  id          String @id @default(cuid())
  chinese     String
  thai        String?
  vietnamese  String?
  indonesian  String?
  malay       String?
  khmer       String?
  burmese     String?
  lao         String?
  category    TermCategory
}
```

## 5. 服务端架构

```mermaid
flowchart LR
    A[Route Handler] --> B[zod 校验]
    B --> C[鉴权中间件]
    C --> D[Service 层]
    D --> E[Prisma]
    D --> F[Redis Queue]
    F --> G[Worker Pipeline]
    G --> G1[OCR Service]
    G --> G2[Translate Service]
    G --> G3[Standard Mapper]
    G --> G4[PDF Generator]
    G --> G5[Word Generator]
    G1 --> H[SSE 进度推送]
    G2 --> H
    G3 --> H
    G4 --> H
    G5 --> H
```

### 5.1 Services 模块

- `lib/services/ocr.ts` — 封装 Google Cloud Vision API
- `lib/services/translate.ts` — 封装 Google Cloud Translation API（含术语预处理/后处理）
- `lib/services/standardMapper.ts` — 正则提取 GB 标准编号 + 查询映射
- `lib/services/pdfGenerator.ts` — puppeteer HTML → PDF
- `lib/services/wordGenerator.ts` — docx 生成 .docx
- `lib/services/translationPipeline.ts` — 串联 OCR→翻译→标准映射→文档生成
- `lib/services/taskQueue.ts` — Redis 简易队列
- `lib/services/sse.ts` — SSE 推送工具
- `lib/services/storage.ts` — 本地/OSS 存储抽象

### 5.2 Redis 队列设计

- Key: `queue:translation` (List 类型)
- Task 结构: `{ orderId, userId, fileUrl, targetLang, outputFormat }`
- Worker: BRPOP 阻塞拉取，处理完成后通过 `order:{id}:progress` 发布 SSE
- 失败重试: 3 次指数退避，超过后置 FAILED

## 6. 环境变量

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seareport"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
GOOGLE_APPLICATION_CREDENTIALS="./config/google-service-account.json"
GOOGLE_TRANSLATE_PROJECT_ID="your-project-id"
ALIBABA_TRANSLATE_ACCESS_KEY_ID="your-access-key"
ALIBABA_TRANSLATE_ACCESS_KEY_SECRET="your-secret"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800"
DEFAULT_PAGE_LIMIT=10
FREE_MONTHLY_QUOTA=1
BASIC_MONTHLY_QUOTA=10
PRO_MONTHLY_QUOTA=30
```

## 7. 开发约束

1. **类型安全**：TypeScript 严格模式，禁用 `any`，所有 API/Service 入口定义接口
2. **输入校验**：所有 API Route 必须用 zod 校验入参
3. **数据库访问**：禁止直接 SQL，统一通过 Prisma
4. **文件上传**：限制类型（PDF/JPG/PNG）和大小（50MB）
5. **异步处理**：翻译任务必须走 Redis 队列，不能阻塞 HTTP 请求
6. **SSE 可靠**：前端 EventSource 断线自动重连（指数退避）
7. **鉴权**：管理后台接口必须验证 ADMIN 角色（中间件统一处理）
8. **统一错误格式**：`{ success: false, error: string }`
9. **响应式**：所有页面必须支持手机端体验
10. **模块化**：OCR、翻译、文档生成封装为独立 service，便于测试和替换

## 8. 实施阶段

| Phase | 内容 | 交付物 |
|------|------|--------|
| 1 | 基础框架 | Next.js 初始化、Tailwind/shadcn、Prisma、NextAuth、布局组件 |
| 2 | 核心翻译流程 | 上传、OCR、翻译、队列、SSE、PDF/Word 生成、翻译页/进度页/结果页 |
| 3 | 标准映射 | seed 数据、standardMapper、标准对照附页、标准查询页 |
| 4 | 用户中心 | 工作台、订单列表、订单详情、账户设置 |
| 5 | 管理后台 | 路由守卫、看板、用户/订单/标准/术语管理 |
| 6 | 收尾 | 首页、定价、登录、Docker 化、响应式细节 |

## 9. 部署架构

```mermaid
flowchart LR
    subgraph Docker Compose
        A[app: Next.js]
        B[db: PostgreSQL 15]
        C[redis: Redis 7]
        A -->|DATABASE_URL| B
        A -->|REDIS_URL| C
        A -->|volume: /app/uploads| V[本地文件卷]
    end
    Browser -->|3000| A
    生产环境 -->|阿里云 OSS| A
```

开发期使用本地 uploads 目录，生产期切换到阿里云 OSS（通过环境变量 `STORAGE_DRIVER=oss` 控制）。
