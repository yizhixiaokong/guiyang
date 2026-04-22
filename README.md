# 贵阳五一旅行攻略

这是一个完全定制化的单页视觉展示项目，用来承载贵阳五一旅行攻略。当前阶段已经搭好 Vite + React + TypeScript 基础工程，并把页面主结构拆成三个模块：景点清单、线路规划、详细时间计划表。

## 当前实现范围

- 顶部海报式首屏和三模块切换骨架
- 景点清单模块的真实高德地图、勾选清单和复制地点名称按钮
- 线路规划模块的多候选线路切换承载位和路线可视化占位
- 详细时间计划表模块的空白承载位
- 材料目录和结构化数据目录
- `.github/skills/` 已加入 `.gitignore`

当前不包含真实线路数据、路径规划服务接入和最终视觉定稿。

## 技术栈

- Vite
- React 19
- TypeScript

## 启动方式

```bash
npm install
npm run dev
```

如果要启用真实高德地图，还需要在项目根目录提供环境变量：

```bash
VITE_AMAP_KEY=你的高德 Web Key
VITE_AMAP_SECURITY_JS_CODE=你的安全密钥
# 生产环境建议改为代理方式
# VITE_AMAP_SERVICE_HOST=https://your-domain/_AMapService
```

构建生产版本：

```bash
npm run build
```

## GitHub Pages 部署

仓库已经补好 GitHub Pages Actions workflow。默认行为：推送到 `main` 后自动构建并发布到 Pages。

发布前需要先在仓库里配置：

1. 打开 GitHub 仓库的 Settings -> Pages，把 Source 切到 GitHub Actions。
2. 打开 Settings -> Secrets and variables -> Actions，按需添加这些 Secrets：

```text
VITE_AMAP_KEY
VITE_AMAP_SECURITY_JS_CODE
VITE_AMAP_SERVICE_HOST
```

说明：

- 如果 GitHub Pages 直接走前端鉴权，只需要前两个 Secret。
- 如果地图改为你自己的代理服务，就改填 `VITE_AMAP_SERVICE_HOST`，同时可以不再提供 `VITE_AMAP_SECURITY_JS_CODE`。
- Vite 会在 GitHub Actions 构建时自动把资源路径切到仓库子路径，例如 `/guiyang/`，本地开发仍然保持根路径 `/`。

首次发布后，页面地址通常是：

```text
https://<你的 GitHub 用户名>.github.io/guiyang/
```

## 目录说明

```text
.
├─ materials/
│  ├─ images/         # 你后续投放图片素材
│  ├─ maps/           # 静态示意地图、截图、底图参考
│  └─ references/     # 参考资料、AI 输出原文、笔记
├─ src/
│  ├─ data/
│  │  ├─ meta/        # 页面全局元信息
│  │  ├─ attractions/ # 景点结构化数据
│  │  └─ routes/      # 路线结构化数据
│  ├─ modules/        # 三个页面模块组件
│  ├─ App.tsx         # 页面壳子与模块切换
│  ├─ App.css         # 模块级样式
│  └─ index.css       # 全局视觉样式
└─ README.md
```

## 数据接入约定

### 景点清单

后续可把景点信息填入 `src/data/attractions/attractions.ts`，字段已经预留为景点名称、区域、经纬度、推荐理由、标签等。页面会自动支持勾选、复制地点名称和地图点位展示。

### 线路规划

后续可把外部 AI 给出的候选线路填入 `src/data/routes/routePlans.ts`。当前结构已经支持多条候选线路切换，后续可以继续强化路线摘要、箭头、时间提示和序号标注。

### 详细时间计划表

这个模块当前故意不做结构化约束。等你把其他 AI 生成的时间计划表内容给我后，我会按那份数据的具体形式做定制展示。

## 地图策略

景点模块已经接入高德 JSAPI v2.0，当前只用了真实底图、点标记和信息窗体。

- 开发环境可直接使用 `VITE_AMAP_KEY` + `VITE_AMAP_SECURITY_JS_CODE`
- 生产环境建议改为 `VITE_AMAP_SERVICE_HOST` 代理，不要把安全密钥暴露到前端
- 组件卸载时已调用 `map.destroy()`，避免 WebGL 上下文泄漏

## 下一阶段建议

1. 把你的高德 Key 和安全密钥填进本地环境变量，先确认景点地图能正常加载
2. 把外部 AI 生成的多条线路结果整理到 `src/data/routes/routePlans.ts`
3. 如果下一步要做真实线路规划，可以继续接入高德 Walking 或 Driving 服务
