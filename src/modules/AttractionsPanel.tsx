import type { Attraction } from '../types'
import { AttractionsAmap } from './AttractionsAmap'
import { AttractionGallery } from './AttractionGallery'

function NavIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.05rem" height="1.05rem" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.05rem" height="1.05rem" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function openAmapNavi(name: string, coordinates: [number, number]) {
  const [lng, lat] = coordinates
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const fallback = encodeURIComponent('https://mobile.amap.com')
  const poiname = encodeURIComponent(name)

  if (isIOS) {
    location.href = `iosamap://navi?sourceApplication=guiyang-guide&poiname=${poiname}&lat=${lat}&lon=${lng}&dev=0&style=2`
    setTimeout(() => { location.href = 'https://mobile.amap.com' }, 2000)
  } else {
    // Android Intent URL：未安装时自动降级到高德网页版
    location.href =
      `intent://navi?sourceApplication=guiyang-guide&poiname=${poiname}&lat=${lat}&lon=${lng}&dev=0&style=2` +
      `#Intent;scheme=androidamap;package=com.autonavi.minimap;S.browser_fallback_url=${fallback};end`
  }
}

function openAmapView(name: string, coordinates: [number, number]) {
  const [lng, lat] = coordinates
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const fallback = encodeURIComponent(`https://mobile.amap.com/poi/coordinate/${lng},${lat}`)
  const poiname = encodeURIComponent(name)

  if (isIOS) {
    location.href = `iosamap://viewMap?sourceApplication=guiyang-guide&poiname=${poiname}&lat=${lat}&lon=${lng}&dev=0`
    setTimeout(() => { location.href = `https://mobile.amap.com/poi/coordinate/${lng},${lat}` }, 2000)
  } else {
    location.href =
      `intent://viewMap?sourceApplication=guiyang-guide&poiname=${poiname}&lat=${lat}&lon=${lng}&dev=0` +
      `#Intent;scheme=androidamap;package=com.autonavi.minimap;S.browser_fallback_url=${fallback};end`
  }
}

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
            先从地图看景点分布，再按兴趣切换到单个景点的图片、门票、时长和亮点信息。
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
              <h3>景点地图总览</h3>
              <p>
                先看城区与花溪方向的分布，再切换到具体景点查看图集和出行信息。
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
                <span>城区段：黔灵山、甲秀楼、文昌阁、省府北街、东山寺、青云市集、民生路</span>
                <span>花溪段：青岩古镇、夜郎谷、天河潭</span>
                <span>文化补充：贵州省博物馆、贵州省地质博物馆</span>
                <span>交通节点（仅图示）：贵阳北站、贵阳东站</span>
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
              <p className="mini-label">Attraction Select</p>
              <h3>景点选择</h3>
            </div>
            <p>点名称切换景点，勾选保留到行程清单。</p>
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
              {selectedAttractions.length > 0 ? '已选景点详情' : '当前景点详情'}
            </h3>
            <p>
              {selectedAttractions.length > 0
                ? '在已选景点之间切换查看图片、门票、时长和亮点。'
                : '先浏览当前景点的图片、门票、开放时间和游玩重点。'}
            </p>
          </div>

          {detailAttraction && (
            <div className="attraction-detail-actions">
              <button
                type="button"
                className="action-button attraction-nav-btn"
                onClick={() => openAmapView(detailAttraction.name, detailAttraction.coordinates)}
                aria-label={`在高德地图中查看${detailAttraction.name}位置`}
              >
                <MapPinIcon />
                查看地点
              </button>
              <button
                type="button"
                className="action-button attraction-nav-btn"
                onClick={() => openAmapNavi(detailAttraction.name, detailAttraction.coordinates)}
                aria-label={`在高德地图中导航到${detailAttraction.name}`}
              >
                <NavIcon />
                导航
              </button>
              <button
                type="button"
                className={isDetailSelected ? 'ghost-button' : 'action-button'}
                onClick={() => onToggleAttraction(detailAttraction.id)}
              >
                {isDetailSelected ? '移出清单' : '加入清单'}
              </button>
            </div>
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
            <h3>选择一个景点后在这里查看详情</h3>
            <p>图片、门票、时长和亮点信息会集中显示在这里。</p>
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