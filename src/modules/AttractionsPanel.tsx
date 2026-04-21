import type { Attraction } from '../types'
import { AttractionsAmap } from './AttractionsAmap'
import { AttractionGallery } from './AttractionGallery'

interface AttractionsPanelProps {
  attractions: Attraction[]
  selectedAttractionIds: string[]
  activeAttractionId: string | null
  onToggleAttraction: (attractionId: string) => void
  onFocusAttraction: (attractionId: string) => void
  onCopySelected: () => void
  copyState: 'idle' | 'copied' | 'error'
}

export function AttractionsPanel({
  attractions,
  selectedAttractionIds,
  activeAttractionId,
  onToggleAttraction,
  onFocusAttraction,
  onCopySelected,
  copyState,
}: AttractionsPanelProps) {
  const mustVisitCount = attractions.filter((attraction) => attraction.priority === '必去').length
  const freeCount = attractions.filter((attraction) => attraction.ticket.includes('免费')).length
  const selectedAttractions = attractions.filter((attraction) =>
    selectedAttractionIds.includes(attraction.id),
  )
  const focusedAttraction = attractions.find((attraction) => attraction.id === activeAttractionId) ?? null
  const detailAttraction = selectedAttractions.length
    ? selectedAttractions.find((attraction) => attraction.id === activeAttractionId) ?? selectedAttractions[0]
    : focusedAttraction ?? attractions[0] ?? null
  const isDetailSelected = detailAttraction
    ? selectedAttractionIds.includes(detailAttraction.id)
    : false

  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 01</p>
          <h2>景点清单</h2>
          <p>
            地图作为主舞台，清单只保留轻量筛选和勾选导出；下方详情区只展开当前查看或已选中的景点，避免把所有内容一次性铺满。
          </p>
        </div>
      </header>

      <div className="metric-strip" aria-label="景点模块状态">
        <article className="metric-card">
          <span className="mini-label">当前景点数</span>
          <strong className="metric-value">{attractions.length}</strong>
          <p>地图优先浏览，手机上也能直接靠点位和简清单切换。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">必去景点</span>
          <strong className="metric-value">{mustVisitCount}</strong>
          <p>优先级高的点会更适合进入五一主线路。</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">已选景点</span>
          <strong className="metric-value">{selectedAttractionIds.length}</strong>
          <p>{freeCount} 个免费点位可优先组合低预算路线。</p>
        </article>
      </div>

      <div className="attraction-stage-layout">
        <section className="attraction-map-stage">
          <div className="attraction-map-toolbar">
            <div>
              <p className="mini-label">AMap Live View</p>
              <h3>地图优先浏览景点分布</h3>
              <p>
                点地图或点右侧简清单都能切换当前查看景点；已勾选的地点会保留在下方详情切换轨道里。
              </p>
            </div>
            <div className="attraction-map-actions">
              <span className="selection-chip">已选 {selectedAttractionIds.length} 个</span>
              <button
                type="button"
                className="action-button"
                onClick={onCopySelected}
                disabled={selectedAttractionIds.length === 0}
              >
                复制已选地点
              </button>
            </div>
          </div>

          <div className="map-placeholder attraction-map-board" aria-label="景点地图">
            <AttractionsAmap
              attractions={attractions}
              selectedAttractionIds={selectedAttractionIds}
              activeAttractionId={activeAttractionId}
              onFocusAttraction={onFocusAttraction}
            />
            <div className="map-caption attraction-map-caption-panel">
              <p className="mini-label">Urban / Hills / Nightlife</p>
              <div className="map-legend compact">
                <span>城区段：黔灵山、甲秀楼、文昌阁、青云市集、民生路</span>
                <span>花溪段：青岩古镇、夜郎谷</span>
                <span>文化补充：贵州省博物馆</span>
              </div>
            </div>
          </div>

          <p className="copy-feedback attraction-copy-feedback" role="status">
            {copyState === 'copied' && '已复制已选地点名称，可直接发给其他 AI。'}
            {copyState === 'error' && '复制失败，请稍后重试。'}
          </p>
        </section>

        <aside className="attraction-selector-panel">
          <div className="selector-header">
            <div>
              <p className="mini-label">Quick Select</p>
              <h3>轻量地点勾选</h3>
            </div>
            <p>点名称查看，勾选加入导出清单。</p>
          </div>

          {attractions.length === 0 ? (
            <div className="empty-state">
              <p>当前还没有录入景点数据。</p>
              <p>你后续可以把候选景点先整理进 src/data/attractions/attractions.ts。</p>
            </div>
          ) : (
            <ul className="compact-checklist-list">
              {attractions.map((attraction) => {
                const isSelected = selectedAttractionIds.includes(attraction.id)
                const isActive = attraction.id === detailAttraction?.id

                return (
                  <li
                    key={attraction.id}
                    className={`compact-checklist-item${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="compact-checklist-focus"
                      onClick={() => onFocusAttraction(attraction.id)}
                    >
                      <span className="compact-checklist-text">
                        <strong>{attraction.name}</strong>
                        <span>
                          {attraction.district} · {attraction.recommendedDuration}
                        </span>
                      </span>
                    </button>
                    <label className="compact-checklist-toggle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleAttraction(attraction.id)}
                      />
                      <span>{isSelected ? '已选' : '加入'}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </div>

      <section className="attraction-detail-shell">
        <header className="attraction-detail-header">
          <div>
            <p className="mini-label">
              {selectedAttractions.length > 0 ? 'Selected Detail' : 'Focused Detail'}
            </p>
            <h3>
              {selectedAttractions.length > 0 ? '已选景点详情联动' : '当前查看景点详情'}
            </h3>
            <p>
              {selectedAttractions.length > 0
                ? '下方只展开当前勾选集合里的景点，不再把所有卡片同时铺开。'
                : '还没有勾选时，会先展示当前地图或清单里聚焦的景点。'}
            </p>
          </div>

          {detailAttraction && (
            <button
              type="button"
              className={isDetailSelected ? 'ghost-button' : 'action-button'}
              onClick={() => onToggleAttraction(detailAttraction.id)}
            >
              {isDetailSelected ? '移出导出清单' : '加入导出清单'}
            </button>
          )}
        </header>

        {selectedAttractions.length > 1 && (
          <div className="detail-switcher-rail" aria-label="已选景点切换">
            {selectedAttractions.map((attraction) => (
              <button
                key={attraction.id}
                type="button"
                className={attraction.id === detailAttraction?.id ? 'detail-chip is-active' : 'detail-chip'}
                onClick={() => onFocusAttraction(attraction.id)}
              >
                <strong>{attraction.name}</strong>
                <span>{attraction.district}</span>
              </button>
            ))}
          </div>
        )}

        {!detailAttraction ? (
          <article className="placeholder-card">
            <p className="mini-label">Attraction Detail Placeholder</p>
            <h3>勾选或点击地图点位后在这里展开详情</h3>
            <p>手机端建议先看地图，再在这里切换缩略图和实用信息。</p>
          </article>
        ) : (
          <article key={detailAttraction.id} className="attraction-card attraction-card-featured">
            <AttractionGallery images={detailAttraction.images} title={detailAttraction.name} />
            <div className="checklist-header">
              <div>
                <p className="mini-label">
                  {detailAttraction.district} · {detailAttraction.category}
                </p>
                <h3>{detailAttraction.name}</h3>
              </div>
              <span className="status-pill">{detailAttraction.priority}</span>
            </div>
            <div className="attraction-summary-block">
              <p>{detailAttraction.summary}</p>
              <p>{detailAttraction.recommendation}</p>
            </div>
            <div className="attraction-detail-grid">
              <div>
                <span className="mini-label">地址</span>
                <strong>{detailAttraction.address}</strong>
              </div>
              <div>
                <span className="mini-label">门票</span>
                <strong>{detailAttraction.ticket}</strong>
              </div>
              <div>
                <span className="mini-label">开放时间</span>
                <strong>{detailAttraction.openingHours}</strong>
              </div>
              <div>
                <span className="mini-label">建议时长</span>
                <strong>{detailAttraction.recommendedDuration}</strong>
              </div>
            </div>
            <div className="attraction-detail-columns">
              <div className="attraction-background">
                <p className="mini-label">背景</p>
                <p>{detailAttraction.background}</p>
              </div>
              <div className="attraction-highlights">
                <p className="mini-label">亮点</p>
                <ul className="highlight-list">
                  {detailAttraction.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="attraction-best-for">
              <span className="mini-label">更适合</span>
              <strong>{detailAttraction.bestFor}</strong>
            </p>
            <ul className="tag-list">
              {detailAttraction.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </section>
  )
}