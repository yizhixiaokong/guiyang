import { useEffect, useState } from 'react'
import './App.css'
import MobileSelector from './modules/MobileSelector'
import { attractions } from './data/attractions/attractions'
import { tripMeta } from './data/meta/tripMeta'
import { routePlans } from './data/routes/routePlans'
import { AttractionsPanel } from './modules/AttractionsPanel'
import { RoutesPanel } from './modules/RoutesPanel'
import { SchedulePanel } from './modules/SchedulePanel'
import type { ModuleKey } from './types'

const SELECTED_ATTRACTIONS_STORAGE_KEY = 'guiyang:selected-attraction-ids'
const ACTIVE_ATTRACTION_STORAGE_KEY = 'guiyang:active-attraction-id'

function getStoredSelectedAttractionIds() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(SELECTED_ATTRACTIONS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    const validAttractionIds = new Set(attractions.map((attraction) => attraction.id))

    return parsedValue.filter(
      (attractionId): attractionId is string =>
        typeof attractionId === 'string' && validAttractionIds.has(attractionId),
    )
  } catch {
    return []
  }
}

function getStoredActiveAttractionId() {
  if (typeof window === 'undefined') {
    return attractions[0]?.id ?? null
  }

  try {
    const rawValue = window.localStorage.getItem(ACTIVE_ATTRACTION_STORAGE_KEY)
    const validAttractionIds = new Set(attractions.map((attraction) => attraction.id))

    if (rawValue && validAttractionIds.has(rawValue)) {
      return rawValue
    }

    return attractions[0]?.id ?? null
  } catch {
    return attractions[0]?.id ?? null
  }
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('attractions')
  const [selectedAttractionIds, setSelectedAttractionIds] = useState<string[]>(
    getStoredSelectedAttractionIds,
  )
  const [activeAttractionId, setActiveAttractionId] = useState<string | null>(
    getStoredActiveAttractionId,
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [activeRouteId, setActiveRouteId] = useState<string | null>(
    routePlans[0]?.id ?? null,
  )

  useEffect(() => {
    window.localStorage.setItem(
      SELECTED_ATTRACTIONS_STORAGE_KEY,
      JSON.stringify(selectedAttractionIds),
    )
  }, [selectedAttractionIds])

  useEffect(() => {
    if (!activeAttractionId) {
      window.localStorage.removeItem(ACTIVE_ATTRACTION_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(ACTIVE_ATTRACTION_STORAGE_KEY, activeAttractionId)
  }, [activeAttractionId])

  const selectedAttractionNames = attractions
    .filter((attraction) => selectedAttractionIds.includes(attraction.id))
    .map((attraction) => attraction.name)
  const mustVisitCount = attractions.filter((attraction) => attraction.priority === '必去').length
  const freeAttractionCount = attractions.filter((attraction) => attraction.ticket.includes('免费')).length
  const districtCount = new Set(attractions.map((attraction) => attraction.district)).size

  const handleAttractionToggle = (attractionId: string) => {
    setCopyState('idle')
    setSelectedAttractionIds((currentIds) => {
      const willSelect = !currentIds.includes(attractionId)
      const nextIds = willSelect
        ? [...currentIds, attractionId]
        : currentIds.filter((id) => id !== attractionId)

      setActiveAttractionId((currentActiveId) => {
        if (willSelect) {
          return attractionId
        }

        if (currentActiveId !== attractionId) {
          return currentActiveId ?? nextIds[0] ?? attractions[0]?.id ?? null
        }

        return nextIds[0] ?? attractions.find((attraction) => attraction.id !== attractionId)?.id ?? null
      })

      return nextIds
    })
  }

  const handleAttractionFocus = (attractionId: string) => {
    setActiveAttractionId(attractionId)
  }

  const handleCopySelected = async () => {
    if (selectedAttractionNames.length === 0) {
      return
    }

    try {
      await navigator.clipboard.writeText(selectedAttractionNames.join('\n'))
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  const moduleOptions = [
    {
      key: 'attractions' as const,
      kicker: 'Module 01',
      title: '景点清单',
      description: '地图看分布、勾选做取舍，先把想去的点位快速收敛出来。',
    },
    {
      key: 'routes' as const,
      kicker: 'Module 02',
      title: '线路规划',
      description: '候选线路切换、路线箭头示意和时间顺序高亮。',
    },
    {
      key: 'schedule' as const,
      kicker: 'Module 03',
      title: '详细时间计划表',
      description: '按天拆解早中晚节奏，补齐后可直接转成可执行行程。',
    },
  ]

  return (
    <div className="page-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">{tripMeta.eyebrow}</p>
          <div className="hero-title-row">
            <h1>{tripMeta.title}</h1>
            <div className="title-stamp">{tripMeta.badge}</div>
          </div>
          <p className="hero-subtitle">{tripMeta.subtitle}</p>
          <div className="hero-meta-grid" aria-label="行程元信息">
            <div>
              <span>日期</span>
              <strong>{tripMeta.dateRange}</strong>
            </div>
            <div>
              <span>风格</span>
              <strong>{tripMeta.style}</strong>
            </div>
            <div>
              <span>地图方案</span>
              <strong>{tripMeta.mapStrategy}</strong>
            </div>
          </div>
        </div>

        <aside className="hero-board">
          <p className="board-kicker">行程速览</p>
          <div className="hero-glance-grid" aria-label="行程速览">
            <article>
              <span>景点总数</span>
              <strong>{attractions.length}</strong>
            </article>
            <article>
              <span>必去点位</span>
              <strong>{mustVisitCount}</strong>
            </article>
            <article>
              <span>免费点位</span>
              <strong>{freeAttractionCount}</strong>
            </article>
            <article>
              <span>覆盖区域</span>
              <strong>{districtCount} 区</strong>
            </article>
          </div>
          <div className="board-ribbon">先看地图分布，再按兴趣做勾选与导出。</div>
          <p className="hero-board-note">当前包含城市地标、老城街巷、花溪山水、博物馆与交通节点图示。</p>
        </aside>
      </header>

      <section className="module-switcher desktop-only" aria-label="模块切换">
        {moduleOptions.map((module) => (
          <button
            key={module.key}
            type="button"
            className={module.key === activeModule ? 'module-tab active' : 'module-tab'}
            onClick={() => setActiveModule(module.key)}
          >
            <span>{module.kicker}</span>
            <strong>{module.title}</strong>
            <small>{module.description}</small>
          </button>
        ))}
      </section>

      <MobileSelector
        variant="auto"
        value={activeModule}
        onChange={(id) => setActiveModule(id as ModuleKey)}
      />

      <main className="stage-panel">
        {activeModule === 'attractions' && (
          <AttractionsPanel
            attractions={attractions}
            selectedAttractionIds={selectedAttractionIds}
            activeAttractionId={activeAttractionId}
            onToggleAttraction={handleAttractionToggle}
            onFocusAttraction={handleAttractionFocus}
            onCopySelected={handleCopySelected}
            copyState={copyState}
          />
        )}

        {activeModule === 'routes' && (
          <RoutesPanel
            routePlans={routePlans}
            activeRouteId={activeRouteId}
            onRouteChange={setActiveRouteId}
          />
        )}

        {activeModule === 'schedule' && <SchedulePanel />}
      </main>

      <footer className="page-footer">
        <p>{tripMeta.footerSummary}</p>
        <p>{tripMeta.lastUpdated}</p>
      </footer>
    </div>
  )
}

export default App
