import type { Attraction } from '../types'

interface AttractionsPanelProps {
  attractions: Attraction[]
  selectedAttractionIds: string[]
  onToggleAttraction: (attractionId: string) => void
  onCopySelected: () => void
  copyState: 'idle' | 'copied' | 'error'
}

export function AttractionsPanel({
  attractions,
  selectedAttractionIds,
  onToggleAttraction,
  onCopySelected,
  copyState,
}: AttractionsPanelProps) {
  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 01</p>
          <h2>景点清单</h2>
          <p>
            这里预留景点详细信息、推荐理由和勾选导出能力。当前先用静态示意地图占位，后续可以继续讨论图钉视觉和地图表达方式。
          </p>
        </div>
      </header>

      <div className="metric-strip" aria-label="景点模块状态">
        <article className="metric-card">
          <span className="mini-label">当前景点数</span>
          <strong className="metric-value">{attractions.length}</strong>
          <p>后续会由你补入贵阳景点的详细信息。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">已勾选地点</span>
          <strong className="metric-value">{selectedAttractionIds.length}</strong>
          <p>复制后直接给其他 AI 做线路规划。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">地图表达</span>
          <strong className="metric-value">Pins</strong>
          <p>当前为静态示意地图承载位，不接真实地图 SDK。</p>
        </article>
      </div>

      <div className="attraction-layout">
        <div className="map-placeholder" aria-label="景点地图占位">
          <div className="placeholder-grid" />
          <div className="placeholder-pins" aria-hidden="true">
            <div className="placeholder-pin" style={{ left: '16%', top: '20%' }}>
              待放置图钉
            </div>
            <div className="placeholder-pin" style={{ left: '58%', top: '28%' }}>
              贵阳景点
            </div>
            <div className="placeholder-pin" style={{ left: '34%', top: '66%' }}>
              推荐标签
            </div>
          </div>
          <div className="map-caption">
            <p className="mini-label">Static Map Placeholder</p>
            <h3>景点图钉示意区</h3>
            <p>
              后续每个景点都可以在这里用图钉、编号或风格化标签呈现，形成旅行海报式的地点导览版面。
            </p>
          </div>
        </div>

        <aside className="checklist-box">
          <div className="checklist-header">
            <div>
              <p className="mini-label">Checklist Export</p>
              <h3>地点勾选清单</h3>
            </div>
            <button
              type="button"
              className="action-button"
              onClick={onCopySelected}
              disabled={selectedAttractionIds.length === 0}
            >
              复制地点名称
            </button>
          </div>

          <p className="copy-feedback" role="status">
            {copyState === 'copied' && '已复制已选地点名称，可直接发给其他 AI。'}
            {copyState === 'error' && '复制失败，请稍后重试。'}
          </p>

          {attractions.length === 0 ? (
            <div className="empty-state">
              <p>当前还没有录入景点数据。</p>
              <p>你后续可以把候选景点先整理进 src/data/attractions/attractions.ts。</p>
            </div>
          ) : (
            <ul className="checklist-list">
              {attractions.map((attraction) => (
                <li key={attraction.id} className="checklist-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAttractionIds.includes(attraction.id)}
                      onChange={() => onToggleAttraction(attraction.id)}
                    />
                    <span className="checklist-meta">
                      <strong>{attraction.name}</strong>
                      <span>{attraction.district}</span>
                      <span>{attraction.recommendation}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="card-list">
        {attractions.length === 0 ? (
          <article className="placeholder-card">
            <p className="mini-label">Attraction Cards Placeholder</p>
            <h3>景点详情卡片将在这里展开</h3>
            <p>
              后续建议每张卡至少包含名称、区域、推荐理由、最佳前往时段、逗留时长和注意事项。
            </p>
          </article>
        ) : (
          attractions.map((attraction) => (
            <article key={attraction.id} className="attraction-card">
              <div className="checklist-header">
                <div>
                  <p className="mini-label">{attraction.district}</p>
                  <h3>{attraction.name}</h3>
                </div>
                <span className="status-pill">{attraction.status}</span>
              </div>
              <p>{attraction.summary}</p>
              <p>{attraction.recommendation}</p>
              <ul className="tag-list">
                {attraction.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </section>
  )
}