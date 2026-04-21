import { useState } from 'react'
import './App.css'
import { attractions } from './data/attractions/attractions'
import { tripMeta } from './data/meta/tripMeta'
import { routePlans } from './data/routes/routePlans'
import { AttractionsPanel } from './modules/AttractionsPanel'
import { RoutesPanel } from './modules/RoutesPanel'
import { SchedulePanel } from './modules/SchedulePanel'
import type { ModuleKey } from './types'

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('attractions')
  const [selectedAttractionIds, setSelectedAttractionIds] = useState<string[]>([])
  const [activeAttractionId, setActiveAttractionId] = useState<string | null>(
    attractions[0]?.id ?? null,
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [activeRouteId, setActiveRouteId] = useState<string | null>(
    routePlans[0]?.id ?? null,
  )

  const selectedAttractionNames = attractions
    .filter((attraction) => selectedAttractionIds.includes(attraction.id))
    .map((attraction) => attraction.name)

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
      description: '图钉地图 + 勾选复制，后续用于喂给外部 AI 做线路规划。',
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
      description: '本轮只留承载位，等你提供其他 AI 数据后再定制。',
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
          <p className="board-kicker">初始制作边界</p>
          <ul>
            {tripMeta.boundaryNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="board-ribbon">定制视觉展示，不追求复用</div>
        </aside>
      </header>

      <section className="module-switcher" aria-label="模块切换">
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
