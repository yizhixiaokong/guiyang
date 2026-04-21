import type { Attraction } from '../types'
import { AttractionsAmap } from './AttractionsAmap'

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
  const mustVisitCount = attractions.filter((attraction) => attraction.priority === '必去').length
  const freeCount = attractions.filter((attraction) => attraction.ticket.includes('免费')).length

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
          <span className="mini-label">必去景点</span>
          <strong className="metric-value">{mustVisitCount}</strong>
          <p>这批点更适合优先进入五一主线路。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">免费优先</span>
          <strong className="metric-value">{freeCount}</strong>
          <p>如果需要控制预算，可以优先围绕免费景点排路线。</p>
        </article>
      </div>

      <div className="attraction-layout">
        <div className="map-placeholder" aria-label="景点地图">
          <AttractionsAmap
            attractions={attractions}
            selectedAttractionIds={selectedAttractionIds}
          />
          <div className="map-caption">
            <p className="mini-label">AMap Live View</p>
            <h3>贵阳景点真实地图分布</h3>
            <p>
              已切到真实高德地图底图。点击点位可看景点摘要，右侧勾选过的景点会在地图上同步高亮。
            </p>
            <div className="map-legend">
              <span>城区段：黔灵山、甲秀楼、文昌阁、青云市集、民生路</span>
              <span>花溪段：青岩古镇、夜郎谷</span>
              <span>文化补充：贵州省博物馆，适合雨天或半日文化线</span>
            </div>
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
                      <span>
                        {attraction.district} · {attraction.category}
                      </span>
                      <span>
                        {attraction.recommendedDuration} · {attraction.ticket}
                      </span>
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
                  <p className="mini-label">
                    {attraction.district} · {attraction.category}
                  </p>
                  <h3>{attraction.name}</h3>
                </div>
                <span className="status-pill">{attraction.priority}</span>
              </div>
              <p>{attraction.summary}</p>
              <p>{attraction.recommendation}</p>
              <div className="attraction-detail-grid">
                <div>
                  <span className="mini-label">地址</span>
                  <strong>{attraction.address}</strong>
                </div>
                <div>
                  <span className="mini-label">门票</span>
                  <strong>{attraction.ticket}</strong>
                </div>
                <div>
                  <span className="mini-label">开放时间</span>
                  <strong>{attraction.openingHours}</strong>
                </div>
                <div>
                  <span className="mini-label">建议时长</span>
                  <strong>{attraction.recommendedDuration}</strong>
                </div>
              </div>
              <div className="attraction-background">
                <p className="mini-label">背景</p>
                <p>{attraction.background}</p>
              </div>
              <div className="attraction-highlights">
                <p className="mini-label">亮点</p>
                <ul className="highlight-list">
                  {attraction.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <p className="attraction-best-for">
                <span className="mini-label">更适合</span>
                <strong>{attraction.bestFor}</strong>
              </p>
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