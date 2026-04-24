import { useEffect, useMemo, useRef, useState } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { Attraction } from '../types'

interface AttractionsAmapProps {
  attractions: Attraction[]
  selectedAttractionIds: string[]
  activeAttractionId: string | null
  onFocusAttraction: (attractionId: string) => void
}

interface AMapConfig {
  appname?: string
}

interface AMapMapInstance {
  addControl: (control: unknown) => void
  destroy: () => void
  add: (markers: AMapMarkerInstance[]) => void
  remove: (markers: AMapMarkerInstance[]) => void
  setFitView: (
    markers: AMapMarkerInstance[],
    immediately?: boolean,
    avoid?: [number, number, number, number],
  ) => void
  clearInfoWindow?: () => void
}

interface AMapMarkerInstance {
  on: (eventName: 'click', handler: () => void) => void
}

interface AMapInfoWindowInstance {
  setContent: (content: string) => void
  open: (map: AMapMapInstance, position: [number, number]) => void
}

interface AMapNamespace {
  getConfig: () => AMapConfig
  Map: new (
    container: HTMLDivElement,
    options: {
      viewMode: '3D'
      zoom: number
      center: [number, number]
      pitch: number
      rotation: number
      mapStyle: string
    },
  ) => AMapMapInstance
  Scale: new (options: { position: string }) => unknown
  ToolBar: new (options: { position: string }) => unknown
  MapType: new (options?: { position: string }) => unknown
  InfoWindow: new (options: {
    anchor: string
    offset: unknown
    isCustom: boolean
    autoMove: boolean
    closeWhenClickMap: boolean
  }) => AMapInfoWindowInstance
  Pixel: new (x: number, y: number) => unknown
  Marker: new (options: {
    position: [number, number]
    offset: unknown
    title: string
    zIndex: number
    content: string
  }) => AMapMarkerInstance
}

const amapKey = import.meta.env.VITE_AMAP_KEY
const amapSecurityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE
const amapServiceHost = import.meta.env.VITE_AMAP_SERVICE_HOST

const stationMarkers = [
  {
    id: 'guiyang-north-railway-station',
    name: '贵阳北站',
    coordinates: [106.674554, 26.619478] as [number, number],
  },
  {
    id: 'guiyang-east-railway-station',
    name: '贵阳东站',
    coordinates: [106.744611, 26.664717] as [number, number],
  },
  {
    id: 'hanting-guiyang-north',
    name: '汉庭酒店（贵阳北站店）',
    coordinates: [106.664088, 26.625049] as [number, number],
  },
] as const

export function createMarkerMarkup(
  attraction: Attraction,
  markerState: 'default' | 'active' | 'selected' | 'active-selected',
) {
  return `
    <div class="amap-attraction-marker is-${markerState}">
      <span class="amap-attraction-pin" aria-hidden="true">
        <span class="amap-attraction-pin-core"></span>
      </span>
      <div class="amap-attraction-badge">
        <strong>${attraction.name}</strong>
      </div>
    </div>
  `
}

export function createStationMarkerMarkup(stationName: string) {
  return `
    <div class="amap-transit-marker">
      <span class="amap-transit-pin" aria-hidden="true"></span>
      <div class="amap-transit-badge">
        <strong>${stationName}</strong>
      </div>
    </div>
  `
}

export function createInfoWindowMarkup(attraction: Attraction) {
  const galleryMarkup = attraction.images.length
    ? `
      <section class="amap-info-gallery">
        <figure class="amap-info-gallery-main">
          <img src="${attraction.images[0].src}" alt="${attraction.images[0].alt}" />
          <figcaption class="amap-info-gallery-caption">${attraction.images[0].caption}</figcaption>
        </figure>
        <div class="amap-info-gallery-thumbs">
          ${attraction.images
            .map(
              (image, index) => `
                <button
                  type="button"
                  class="amap-info-thumb${index === 0 ? ' is-active' : ''}"
                  data-image-src="${image.src}"
                  data-image-alt="${image.alt}"
                  data-image-caption="${image.caption}"
                  aria-label="切换到 ${attraction.name} 图片 ${index + 1}"
                >
                  <img src="${image.src}" alt="${image.alt}" />
                </button>
              `,
            )
            .join('')}
        </div>
      </section>
    `
    : ''

  return `
    <article class="amap-info-window">
      <header class="amap-info-header">
        <div>
          <p class="amap-info-kicker">${attraction.district} · ${attraction.category}</p>
          <h4>${attraction.name}</h4>
        </div>
        <button type="button" class="amap-info-close" aria-label="关闭详情">×</button>
      </header>
      ${galleryMarkup}
      <p>${attraction.summary}</p>
      <dl>
        <div>
          <dt>门票</dt>
          <dd>${attraction.ticket}</dd>
        </div>
        <div>
          <dt>开放</dt>
          <dd>${attraction.openingHours}</dd>
        </div>
        <div>
          <dt>时长</dt>
          <dd>${attraction.recommendedDuration}</dd>
        </div>
      </dl>
    </article>
  `
}

export function AttractionsAmap({
  attractions,
  selectedAttractionIds,
  activeAttractionId,
  onFocusAttraction,
}: AttractionsAmapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<AMapMapInstance | null>(null)
  const amapRef = useRef<AMapNamespace | null>(null)
  const markersRef = useRef<AMapMarkerInstance[]>([])
  const infoWindowRef = useRef<AMapInfoWindowInstance | null>(null)
  const hasFittedViewRef = useRef(false)
  const attractionKeyRef = useRef('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const handleResetView = () => {
    if (!mapRef.current || markersRef.current.length === 0) {
      return
    }

    mapRef.current.setFitView(markersRef.current, false, [72, 72, 72, 72])
    mapRef.current.clearInfoWindow?.()
  }

  useEffect(() => {
    const handleInfoInteractions = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const closeButton = target?.closest<HTMLButtonElement>('.amap-info-close')

      if (closeButton) {
        mapRef.current?.clearInfoWindow?.()
        return
      }

      const thumbButton = target?.closest<HTMLButtonElement>('.amap-info-thumb')

      if (!thumbButton) {
        return
      }

      const galleryRoot = thumbButton.closest<HTMLElement>('.amap-info-gallery')
      const mainImage = galleryRoot?.querySelector<HTMLImageElement>('.amap-info-gallery-main img')
      const caption = galleryRoot?.querySelector<HTMLElement>('.amap-info-gallery-caption')
      const imageSrc = thumbButton.dataset.imageSrc

      if (!galleryRoot || !mainImage || !caption || !imageSrc) {
        return
      }

      mainImage.src = imageSrc
      mainImage.alt = thumbButton.dataset.imageAlt ?? ''
      caption.textContent = thumbButton.dataset.imageCaption ?? ''

      galleryRoot.querySelectorAll<HTMLButtonElement>('.amap-info-thumb').forEach((button) => {
        button.classList.remove('is-active')
      })

      thumbButton.classList.add('is-active')
    }

    document.addEventListener('click', handleInfoInteractions)

    return () => {
      document.removeEventListener('click', handleInfoInteractions)
    }
  }, [])

  const mapConfigState = useMemo(() => {
    if (!amapKey) {
      return {
        ready: false,
        title: '等待配置高德 Key',
        description: '在 .env.local 中添加 VITE_AMAP_KEY 后，这里会切换成真实可缩放地图。',
      }
    }

    if (!amapSecurityJsCode && !amapServiceHost) {
      return {
        ready: false,
        title: '等待配置安全凭据',
        description:
          '还需要提供 VITE_AMAP_SECURITY_JS_CODE，或配置 VITE_AMAP_SERVICE_HOST 走代理后，地图才能完成鉴权。',
      }
    }

    return {
      ready: true,
      title: '',
      description: '',
    }
  }, [])

  useEffect(() => {
    if (!mapConfigState.ready || !mapContainerRef.current) {
      return
    }

    let disposed = false

    window._AMapSecurityConfig = amapServiceHost
      ? { serviceHost: amapServiceHost }
      : { securityJsCode: amapSecurityJsCode }

    AMapLoader.load({
      key: amapKey!,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MapType'],
    })
      .then((AMap) => {
        if (disposed || !mapContainerRef.current) {
          return
        }

        const amapNamespace = AMap as unknown as AMapNamespace

        amapNamespace.getConfig().appname = 'amap-jsapi-skill'

        const map = new amapNamespace.Map(mapContainerRef.current, {
          viewMode: '3D',
          zoom: 11.6,
          center: [106.7028, 26.5783],
          pitch: 0,
          rotation: 0,
          mapStyle: 'amap://styles/normal',
        })

        map.addControl(new amapNamespace.Scale({ position: 'LB' }))
        map.addControl(new amapNamespace.ToolBar({ position: 'RT' }))
        map.addControl(new amapNamespace.MapType({ position: 'RB' }))

        mapRef.current = map
        amapRef.current = amapNamespace
        setIsMapReady(true)
        setLoadError(null)
      })
      .catch((error) => {
        if (!disposed) {
          setLoadError(error instanceof Error ? error.message : '地图加载失败，请检查 Key 与安全配置。')
        }
      })

    return () => {
      disposed = true

      if (infoWindowRef.current && mapRef.current) {
        mapRef.current.clearInfoWindow?.()
      }

      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }

      hasFittedViewRef.current = false
      attractionKeyRef.current = ''
      markersRef.current = []
      infoWindowRef.current = null
      amapRef.current = null
      setIsMapReady(false)
    }
  }, [mapConfigState.ready])

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !amapRef.current) {
      return
    }

    const map = mapRef.current
    const AMap = amapRef.current

    if (markersRef.current.length > 0) {
      map.remove(markersRef.current)
    }

    const infoWindow = new AMap.InfoWindow({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -18),
      isCustom: true,
      autoMove: true,
      closeWhenClickMap: true,
    })

    infoWindowRef.current = infoWindow

    const attractionKey = attractions
      .map((attraction) => `${attraction.id}:${attraction.coordinates[0]},${attraction.coordinates[1]}`)
      .join('|')

    const shouldFitView = !hasFittedViewRef.current || attractionKeyRef.current !== attractionKey

    const markers = attractions.map((attraction) => {
      const isChecked = selectedAttractionIds.includes(attraction.id)
      const isActive = attraction.id === activeAttractionId
      const markerState = isChecked && isActive
        ? 'active-selected'
        : isChecked
          ? 'selected'
          : isActive
            ? 'active'
            : 'default'

      const marker = new AMap.Marker({
        position: attraction.coordinates,
        offset: new AMap.Pixel(-18, -52),
        title: attraction.name,
        zIndex: isChecked || isActive ? 140 : 100,
        content: createMarkerMarkup(attraction, markerState),
      })

      marker.on('click', () => {
        onFocusAttraction(attraction.id)
        infoWindow.setContent(createInfoWindowMarkup(attraction))
        infoWindow.open(map, attraction.coordinates)
      })

      return marker
    })

    const stationOverlays = stationMarkers.map((station) => {
      return new AMap.Marker({
        position: station.coordinates,
        offset: new AMap.Pixel(-12, -42),
        title: station.name,
        zIndex: 90,
        content: createStationMarkerMarkup(station.name),
      })
    })

    const allMarkers = [...markers, ...stationOverlays]

    map.add(allMarkers)

    if (shouldFitView) {
      map.setFitView(allMarkers, false, [72, 72, 72, 72])
      hasFittedViewRef.current = true
      attractionKeyRef.current = attractionKey
    }

    markersRef.current = allMarkers
  }, [activeAttractionId, attractions, isMapReady, onFocusAttraction, selectedAttractionIds])

  return (
    <div className="amap-shell" aria-label="贵阳景点高德地图">
      <div ref={mapContainerRef} className="amap-canvas" />

      {mapConfigState.ready && !loadError && (
        <button type="button" className="amap-reset-view" onClick={handleResetView}>
          回到景点总览
        </button>
      )}

      {!mapConfigState.ready && (
        <div className="amap-overlay-state">
          <p className="mini-label">AMap Config Required</p>
          <h3>{mapConfigState.title}</h3>
          <p>{mapConfigState.description}</p>
        </div>
      )}

      {mapConfigState.ready && loadError && (
        <div className="amap-overlay-state is-error">
          <p className="mini-label">AMap Load Error</p>
          <h3>地图初始化失败</h3>
          <p>{loadError}</p>
        </div>
      )}
    </div>
  )
}