import type { RoutePlan } from '../types'
import { RouteMap } from './RouteMap'

interface RoutesPanelProps {
  routePlans: RoutePlan[]
  activeRouteId: string | null
  onRouteChange: (routeId: string) => void
}

export function RoutesPanel({
  routePlans,
  activeRouteId,
  onRouteChange,
}: RoutesPanelProps) {
  const activeRoute =
    routePlans.find((routePlan) => routePlan.id === activeRouteId) ?? routePlans[0] ?? null

  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 02</p>
          <h2>线路规划</h2>
          <p>
            对比不同的一日路线安排，快速查看停留顺序、时间节奏和适合人群。
          </p>
        </div>
      </header>

      <div className="metric-strip" aria-label="线路模块状态">
        <article className="metric-card">
          <span className="mini-label">候选线路数</span>
          <strong className="metric-value">{routePlans.length}</strong>
          <p>可在不同路线方案之间快速切换比较。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">可视化重点</span>
          <strong className="metric-value">Flow</strong>
          <p>凸显地点顺序、时间段和移动方向。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">当前地图方案</span>
          <strong className="metric-value">Static</strong>
          <p>静态示意图优先，等信息层级稳定后再考虑真实地图。</p>
        </article>
      </div>

      <div className="route-switcher" aria-label="候选线路切换">
        {routePlans.length === 0 ? (
          <button type="button" className="ghost-button" disabled>
            暂无候选线路数据
          </button>
        ) : (
          routePlans.map((routePlan) => (
            <button
              key={routePlan.id}
              type="button"
              className={routePlan.id === activeRoute?.id ? 'active' : ''}
              onClick={() => onRouteChange(routePlan.id)}
            >
              {routePlan.name}
            </button>
          ))
        )}
      </div>

      <div className="routes-layout">
        <div className="route-map-placeholder" aria-label="线路地图">
            <div className="route-map-board-wrapper">
              <RouteMap stops={activeRoute?.stops ?? []} />
            </div>
            <div className="route-map-caption">
              <p className="mini-label">当日线路</p>
              <h3>{activeRoute?.name ?? '线路详情'}</h3>
              <p>地图仅展示当前所选日期的景点顺序与移动方向（线 + 箭头）。</p>
            </div>
          </div>

        <aside className="route-summary">
          <header>
            <div>
              <p className="mini-label">Current Route</p>
              <h3>{activeRoute?.name ?? '等待外部 AI 输出候选线路'}</h3>
            </div>
            <span className="status-pill">{activeRoute?.status ?? 'empty'}</span>
          </header>

          {activeRoute ? (
            <>
              <p>{activeRoute.summary}</p>
              <div className="route-summary-grid">
                <div>
                  <span className="mini-label">总时长</span>
                  <strong>{activeRoute.totalDuration}</strong>
                </div>
                <div>
                  <span className="mini-label">强度</span>
                  <strong>{activeRoute.intensity}</strong>
                </div>
                <div>
                  <span className="mini-label">适合人群</span>
                  <strong>{activeRoute.suitableFor}</strong>
                </div>
              </div>
              <ul className="route-stop-list">
                {activeRoute.stops.map((stop) => (
                  <li key={stop.id}>
                    <span className="mini-label">Stop {stop.order}</span>
                    <strong>{stop.label}</strong>
                    <span>{stop.timeHint}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty-state">
              <p>当前还没有线路规划数据。</p>
              <p>补入路线方案后，这里会展示不同路线的节奏与停留顺序。</p>
            </div>
          )}
        </aside>
      </div>

      <div className="stage-note">
        这一区域更适合做路线比较和节奏判断，而不是逐段导航。
      </div>
    </section>
  )
}