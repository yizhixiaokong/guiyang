# 贵阳五一旅行攻略

一个为贵阳五一旅行定制的单页互动攻略应用，提供景点浏览、线路规划和行程清单三大功能模块。

## 功能概览

### 模块 01 · 景点清单
- 真实高德地图（WebGL 2.0）展示景点点位，支持点击聚焦
- 景点卡片轮播，含图片画廊、门票、开放时间、游玩重点等详细信息
- 勾选景点加入"导出清单"，一键复制全部已选景点名称
- 景点详情支持**查看地点**（高德地图定位）和**导航**（高德地图导航）两个快捷入口，Android / iOS 双端兼容，未安装时自动降级到网页版

### 模块 02 · 线路规划
- 多条候选线路切换，含线路摘要、时长、强度和适合人群信息
- 路线站点可视化（顺序展示）

### 模块 03 · 行程清单
- 自由增删 Todo 任务，支持设置日期和时间
- 基于 `@dnd-kit` 的拖拽排序，移动端长按触发
- 任务状态和列表自动持久化到 `localStorage`（key: `guiyang.schedule.todo.tasks.v1`）
- 日期时间选择器使用 `react-datepicker`，手机端以底部抽屉形式弹出

## 技术栈

| 层级 | 依赖 |
|------|------|
| 框架 | Vite · React 19 · TypeScript |
| 地图 | 高德地图 JSAPI v2.0（WebGL） |
| 拖拽 | @dnd-kit/core · @dnd-kit/sortable · @dnd-kit/utilities |
| 日期选择 | react-datepicker |
| 样式 | CSS Custom Properties，无 UI 框架 |

## 快速开始

```bash
npm install
npm run dev
```

### 环境变量

在项目根目录创建 `.env.local`：

```bash
VITE_AMAP_KEY=你的高德 Web Key
VITE_AMAP_SECURITY_JS_CODE=你的安全密钥
# 生产环境建议改为代理方式（可替代上面的安全密钥）
# VITE_AMAP_SERVICE_HOST=https://your-domain/_AMapService
```

### 构建

```bash
npm run build
```

## GitHub Pages 部署

推送到 `main` 后自动触发 Actions 构建并发布。首次使用需要：

1. 仓库 **Settings → Pages** 将 Source 设为 **GitHub Actions**
2. 仓库 **Settings → Secrets and variables → Actions** 添加以下 Secret：

```text
VITE_AMAP_KEY
VITE_AMAP_SECURITY_JS_CODE
# 或 VITE_AMAP_SERVICE_HOST（代理模式）
```

发布后访问地址：

```text
https://<你的 GitHub 用户名>.github.io/guiyang/
```

> 本地开发保持根路径 `/`，Vite 在 CI 构建时自动切到仓库子路径。

## 目录结构

```text
.
├── materials/
│   ├── images/           # 图片素材
│   ├── maps/             # 地图截图、底图参考
│   └── references/       # 参考资料、景点清单、线路规划文字稿
├── src/
│   ├── data/
│   │   ├── meta/         # 页面全局元信息（tripMeta.ts）
│   │   ├── attractions/  # 景点结构化数据（attractions.ts）
│   │   └── routes/       # 线路结构化数据（routePlans.ts）
│   ├── modules/
│   │   ├── AttractionsPanel.tsx   # 景点清单模块
│   │   ├── AttractionsAmap.tsx    # 高德地图组件
│   │   ├── AttractionGallery.tsx  # 图片画廊组件
│   │   ├── RouteMap.tsx           # 线路地图组件
│   │   ├── RoutesPanel.tsx        # 线路规划模块
│   │   ├── SchedulePanel.tsx      # 行程清单模块
│   │   ├── MobileSelector.tsx     # 移动端模块选择器
│   │   └── mapUtils.ts            # 高德地图工具函数
│   ├── types.ts          # 全局类型定义
│   ├── App.tsx           # 页面壳与模块切换
│   ├── App.css           # 模块级样式
│   └── index.css         # 全局视觉样式（CSS 变量）
└── README.md
```

## 数据维护

### 景点数据（`src/data/attractions/attractions.ts`）

每个景点包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一标识 |
| `name` | `string` | 景点名称 |
| `district` | `string` | 所在区 |
| `category` | `string` | 分类（自然/历史/文化…） |
| `coordinates` | `[number, number]` | GCJ-02 经纬度 `[lng, lat]` |
| `priority` | `'必去' \| '推荐'` | 优先级标签 |
| `ticket` | `string` | 门票信息 |
| `openingHours` | `string` | 开放时间 |
| `recommendedDuration` | `string` | 建议游玩时长 |
| `highlights` | `string[]` | 游玩亮点 |
| `images` | `AttractionImage[]` | 图片列表（`src / alt / caption`） |

### 线路数据（`src/data/routes/routePlans.ts`）

每条路线包含 `name / summary / totalDuration / intensity / suitableFor` 和有序的 `stops` 数组。

### 全局元信息（`src/data/meta/tripMeta.ts`）

页面标题、副标题、日期区间、页脚摘要等配置项。

## localStorage 说明

| Key | 内容 |
|-----|------|
| `guiyang.schedule.todo.tasks.v1` | 行程清单任务列表（JSON） |
| `guiyang:selected-attraction-ids` | 已选景点 ID 列表 |
| `guiyang:active-attraction-id` | 当前聚焦景点 ID |


## 下一阶段建议

1. 把你的高德 Key 和安全密钥填进本地环境变量，先确认景点地图能正常加载
2. 把外部 AI 生成的多条线路结果整理到 `src/data/routes/routePlans.ts`
3. 如果下一步要做真实线路规划，可以继续接入高德 Walking 或 Driving 服务
