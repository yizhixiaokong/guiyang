export type ModuleKey = 'attractions' | 'routes' | 'schedule'

export interface Attraction {
  id: string
  name: string
  district: string
  summary: string
  recommendation: string
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
  style: string
  mapStrategy: string
  footerSummary: string
  lastUpdated: string
  boundaryNotes: string[]
}