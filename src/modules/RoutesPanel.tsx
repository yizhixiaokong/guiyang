import type { RoutePlan } from '../types'
import { useState, useEffect } from 'react'
import { RouteMap } from './RouteMap'

interface RoutesPanelProps {
  routePlans: RoutePlan[]
  activeRouteId: string | null
  onRouteChange: (routeId: string) => void
}

export function RoutesPanel({ routePlans, activeRouteId, onRouteChange }: RoutesPanelProps) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [highlightedStopId, setHighlightedStopId] = useState<string | null>(null)

  const activeRoute =
    routePlans.find((routePlan) => routePlan.id === activeRouteId) ?? routePlans[0] ?? null

  useEffect(() => {
    // clear any highlighted stop when switching routes/dates
    setHighlightedStopId(null)
  }, [activeRoute?.id])

  return (
    <section className="module-shell routes-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 02</p>
          <h2>线路规划</h2>
          <p>已确定每日主线；切换日期即可查看当天线路（地图以线与箭头呈现）。</p>
        </div>
      </header>

      <div className="routes-toolbar">
        <div className="date-tabs" role="tablist" aria-label="按天切换线路">
          {routePlans.map((routePlan) => (
            <button
              key={routePlan.id}
              role="tab"
              aria-selected={routePlan.id === activeRoute?.id}
              className={`date-tab ${routePlan.id === activeRoute?.id ? 'is-active' : ''}`}
              onClick={() => onRouteChange(routePlan.id)}
            >
              <span className="tab-title">{routePlan.name}</span>
              <span className="tab-sub">{routePlan.totalDuration}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="ghost-button summary-toggle"
            onClick={() => setIsSummaryOpen((s) => !s)}
            aria-pressed={isSummaryOpen}
            aria-label={isSummaryOpen ? '隐藏详情' : '显示详情'}
          >
            <svg className="toggle-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="toggle-label">{isSummaryOpen ? '隐藏' : '详情'}</span>
          </button>
        </div>
      </div>

      <div className={`routes-layout ${isSummaryOpen ? 'summary-open' : ''}`}>
        <div className="route-map-area" aria-label="线路地图">
            <div className="route-map-board-wrapper">
              <RouteMap
                stops={activeRoute?.stops ?? []}
                highlightStopId={highlightedStopId}
                onStopClick={(id) => setHighlightedStopId(id)}
              />
            </div>
        </div>

        <aside className={`route-summary ${isSummaryOpen ? 'is-open' : 'is-closed'}`}>
          <header>
            <div>
              <p className="mini-label">当日线路</p>
              <h3>{activeRoute?.name ?? '无线路数据'}</h3>
            </div>
            <span className="status-pill">{activeRoute?.status ?? 'empty'}</span>
          </header>

          {activeRoute ? (
            <>
              <p className="route-summary-intro">{activeRoute.summary}</p>

              <div className="route-summary-grid">
                <div>
                  <span className="mini-label">总时长</span>
                  <strong>{activeRoute.totalDuration}</strong>
                </div>
                <div>
                  <span className="mini-label">强度</span>
                  <strong>{activeRoute.intensity}</strong>
                </div>
              </div>

              <div className="route-timeline" aria-live="polite">
                {activeRoute.stops.map((stop, idx) => (
                  <div
                    key={`${stop.id}-${stop.order ?? idx}`}
                    className={`timeline-item ${highlightedStopId === stop.id ? 'is-active' : ''}`}
                    onClick={() => setHighlightedStopId(stop.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setHighlightedStopId(stop.id)
                    }}
                  >
                    <div className="timeline-card">
                      <div className="order-badge">{String(stop.order).padStart(2, '0')}</div>
                      <div className="card-body">
                        <div className="stop-label">{stop.label}</div>
                        <div className="stop-time visually-hidden">{stop.timeHint}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>当前还没有线路规划数据。</p>
            </div>
          )}
        </aside>
      </div>

      
    </section>
  )
}