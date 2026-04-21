import type { TripMeta } from '../../types'

export const tripMeta: TripMeta = {
  eyebrow: 'Guiyang May Day Visual Deck',
  title: '贵阳五一旅行攻略',
  subtitle:
    '先把页面做成一张可切换的旅行海报，再逐步填入景点、路线和时间安排。当前版本已经接入真实高德地图，继续保持定制化展示而不是通用后台。',
  badge: '051',
  dateRange: '五一假期 / 数据待补',
  style: '旅行海报信息图感',
  mapStrategy: '高德真实地图 + 信息海报布局',
  footerSummary: '当前版本适合先录入景点与线路，第三模块等你提供外部 AI 结果后再做定制展示。',
  lastUpdated: '更新于 2026.04.21',
  boundaryNotes: [
    '景点、线路与时间表都按定制项目处理，不追求复用配置。',
    '第一版先完成视觉承载层，再逐步替换为真实数据。',
    '景点模块已接入真实高德地图，后续路线模块再决定是否接入路径规划服务。',
  ],
}