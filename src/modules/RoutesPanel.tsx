import type { RoutePlan } from '../types'

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
            这个模块为多条候选线路预留切换和可视化区域。未来接入数据后，路线图上会重点呈现箭头、顺序编号和时间提示，而不是通用导航地图。
          </p>
        </div>
      </header>

      <div className="metric-strip" aria-label="线路模块状态">
        <article className="metric-card">
          <span className="mini-label">候选线路数</span>
          <strong className="metric-value">{routePlans.length}</strong>
          <p>支持多条路线方案并排切换，不只保留单条线路。</p>
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
        <div className="route-map-placeholder" aria-label="线路地图占位">
          <div className="route-lines" />
          <div className="route-nodes" aria-hidden="true">
            <div className="route-node" style={{ left: '12%', top: '22%' }}>
              01
            </div>
            <div className="route-node" style={{ left: '46%', top: '48%' }}>
              02
            </div>
            <div className="route-node" style={{ left: '72%', top: '24%' }}>
              03
            </div>
          </div>
          <div className="route-map-caption">
            <p className="mini-label">Route Diagram Placeholder</p>
            <h3>线路箭头与时间标注示意区</h3>
            <p>
              这里将用于绘制候选线路的串联关系、停留顺序、时间标记和出行方向。
            </p>
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
              <p>等你把外部 AI 生成的多条线路给我后，我会把这里改成真实的路线对比视图。</p>
            </div>
          )}
        </aside>
      </div>

      <div className="stage-note">
        当前版本优先把“路线表达方式”搭出来，而不是追求真实地图能力。后续如果确认需要接入真实地图，再单独升级这部分。
      </div>
    </section>
  )
}