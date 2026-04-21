import { useEffect, useMemo, useRef, useState } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { Attraction } from '../types'

interface AttractionsAmapProps {
  attractions: Attraction[]
  selectedAttractionIds: string[]
}

interface AMapConfig {
  appname?: string
}

interface AMapMapInstance {
  addControl: (control: unknown) => void
  destroy: () => void
  clearMap: () => void
  add: (markers: AMapMarkerInstance[]) => void
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

function createMarkerMarkup(attraction: Attraction, order: number, isSelected: boolean) {
  return `
    <div class="amap-attraction-marker${isSelected ? ' is-selected' : ''}">
      <span class="amap-attraction-order">${String(order + 1).padStart(2, '0')}</span>
      <div class="amap-attraction-badge">
        <strong>${attraction.name}</strong>
        <small>${attraction.priority}</small>
      </div>
    </div>
  `
}

function createInfoWindowMarkup(attraction: Attraction) {
  return `
    <article class="amap-info-window">
      <p class="amap-info-kicker">${attraction.district} · ${attraction.category}</p>
      <h4>${attraction.name}</h4>
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

export function AttractionsAmap({ attractions, selectedAttractionIds }: AttractionsAmapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<AMapMapInstance | null>(null)
  const amapRef = useRef<AMapNamespace | null>(null)
  const markersRef = useRef<AMapMarkerInstance[]>([])
  const infoWindowRef = useRef<AMapInfoWindowInstance | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

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
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })
      .then((AMap) => {
        if (disposed || !mapContainerRef.current) {
          return
        }

        const amapNamespace = AMap as unknown as AMapNamespace

        amapNamespace.getConfig().appname = 'amap-jsapi-skill'

        const map = new amapNamespace.Map(mapContainerRef.current, {
          viewMode: '3D',
          zoom: 10.8,
          center: [106.7028, 26.5783],
          pitch: 28,
          rotation: -12,
          mapStyle: 'amap://styles/whitesmoke',
        })

        map.addControl(new amapNamespace.Scale({ position: 'LB' }))
        map.addControl(new amapNamespace.ToolBar({ position: 'RT' }))

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

    map.clearMap()

    const infoWindow = new AMap.InfoWindow({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -26),
      isCustom: true,
      autoMove: true,
      closeWhenClickMap: true,
    })

    infoWindowRef.current = infoWindow

    const markers = attractions.map((attraction, index) => {
      const isSelected = selectedAttractionIds.includes(attraction.id)

      const marker = new AMap.Marker({
        position: attraction.coordinates,
        offset: new AMap.Pixel(-20, -20),
        title: attraction.name,
        zIndex: isSelected ? 140 : 100,
        content: createMarkerMarkup(attraction, index, isSelected),
      })

      marker.on('click', () => {
        infoWindow.setContent(createInfoWindowMarkup(attraction))
        infoWindow.open(map, attraction.coordinates)
      })

      return marker
    })

    map.add(markers)
    map.setFitView(markers, false, [72, 72, 72, 72])
    markersRef.current = markers
  }, [attractions, isMapReady, selectedAttractionIds])

  return (
    <div className="amap-shell" aria-label="贵阳景点高德地图">
      <div ref={mapContainerRef} className="amap-canvas" />

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