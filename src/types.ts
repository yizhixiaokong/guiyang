export type ModuleKey = 'attractions' | 'routes' | 'schedule'

export interface AttractionImage {
  src: string
  alt: string
  caption: string
}

export interface Attraction {
  id: string
  name: string
  district: string
  category: string
  address: string
  coordinates: [number, number]
  background: string
  summary: string
  recommendation: string
  highlights: string[]
  ticket: string
  openingHours: string
  recommendedDuration: string
  priority: '必去' | '推荐'
  bestFor: string
  images: AttractionImage[]
  tags: string[]
  status: 'empty' | 'draft' | 'ready'
}

export interface RouteStop {
  id: string
  label: string
  timeHint: string
  order: number
}

export interface RoutePlan {
  id: string
  name: string
  summary: string
  totalDuration: string
  intensity: string
  suitableFor: string
  status: 'empty' | 'draft' | 'ready'
  stops: RouteStop[]
}

export interface TripMeta {
  eyebrow: string
  title: string
  subtitle: string
  badge: string
  dateRange: string
  // 视觉/描述字段（保留但不一定显示在 Hero）
  style: string
  mapStrategy: string
  // 新增：行程时长（例如："3天2夜"）和亮点（1-2 项短句）
  duration?: string
  highlights?: string[]
  footerSummary: string
  lastUpdated: string
  boundaryNotes: string[]
}