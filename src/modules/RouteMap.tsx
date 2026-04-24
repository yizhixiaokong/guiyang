import { useEffect, useRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { RouteStop } from '../types'
import { attractions } from '../data/attractions/attractions'

const amapKey = import.meta.env.VITE_AMAP_KEY
const amapSecurityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE
const amapServiceHost = import.meta.env.VITE_AMAP_SERVICE_HOST

interface RouteMapProps {
  stops: RouteStop[]
}

export function RouteMap({ stops }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const amapRef = useRef<any | null>(null)
  const overlaysRef = useRef<any[]>([])

  useEffect(() => {
    if (!containerRef.current) return
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
        if (disposed || !containerRef.current) return
        const amap = AMap as any
        amap.getConfig().appname = 'route-planner'

        const map = new amap.Map(containerRef.current, {
          viewMode: '3D',
          zoom: 11.6,
          center: [106.7028, 26.5783],
          pitch: 0,
          rotation: 0,
          mapStyle: 'amap://styles/normal',
        })

        map.addControl(new amap.Scale({ position: 'LB' }))
        map.addControl(new amap.ToolBar({ position: 'RT' }))
        map.addControl(new amap.MapType({ position: 'RB' }))

        mapRef.current = map
        amapRef.current = amap

        // initial draw if stops already provided
        if (stops && stops.length) {
          drawForStops(stops)
        }
      })
      .catch((e) => {
        console.error('地图加载失败', e)
      })

    return () => {
      disposed = true
      if (mapRef.current) {
        try {
          mapRef.current.destroy()
        } catch {}
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // redraw whenever stops change
  useEffect(() => {
    if (!mapRef.current || !amapRef.current) return
    drawForStops(stops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops])

  function drawForStops(stopsList: RouteStop[]) {
    const map = mapRef.current
    const amap = amapRef.current
    if (!map || !amap) return

    // remove previous overlays
    try {
      if (overlaysRef.current.length) map.remove(overlaysRef.current)
    } catch {}
    overlaysRef.current = []

    const stationMap: Record<string, [number, number]> = {
      'guiyang-north-railway-station': [106.674554, 26.619478],
      'guiyang-east-railway-station': [106.744611, 26.664717],
      'hanting-guiyang-north': [106.664088, 26.625049],
    }

    const getCoord = (id: string): [number, number] | undefined => {
      const found = attractions.find((a) => a.id === id)
      if (found) return found.coordinates
      return stationMap[id]
    }

    const coords = stopsList.map((s) => getCoord(s.id)).filter(Boolean) as [number, number][]

    if (coords.length === 0) return

    if (coords.length === 1) {
      map.setCenter(coords[0])
      map.setZoom(14)
      return
    }

    // draw polyline
    const polyline = new amap.Polyline({
      path: coords,
      strokeColor: '#e0533b',
      strokeWeight: 5,
      lineJoin: 'round',
      lineCap: 'round',
    })
    map.add(polyline)
    overlaysRef.current.push(polyline)

    // stop badges
    stopsList.forEach((stop, idx) => {
      const coord = coords[idx]
      if (!coord) return
      const order = stop.order ?? idx + 1
      const label = stop.label ?? ''
      const html = `
        <div class="route-stop-badge">
          <span class="stop-order">${String(order).padStart(2, '0')}</span>
          <span class="stop-label">${label}</span>
        </div>
      `

      const marker = new amap.Marker({
        position: coord,
        content: html,
        offset: new amap.Pixel(-40, -48),
      })
      map.add(marker)
      overlaysRef.current.push(marker)
    })

    // arrows for each segment
    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i]
      const [lng2, lat2] = coords[i + 1]
      const mid: [number, number] = [(lng1 + lng2) / 2, (lat1 + lat2) / 2]
      const angle = (Math.atan2(lat2 - lat1, lng2 - lng1) * 180) / Math.PI
      const arrowSvg = `
        <div class="route-arrow" style="transform: rotate(${angle}deg)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0533b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h18"></path>
            <path d="M15 6l6 6-6 6"></path>
          </svg>
        </div>
      `
      const arrowMarker = new amap.Marker({
        position: mid,
        content: arrowSvg,
        offset: new amap.Pixel(-9, -9),
      })
      map.add(arrowMarker)
      overlaysRef.current.push(arrowMarker)
    }

    try {
      map.setFitView(overlaysRef.current, false, [72, 72, 72, 72])
    } catch {}
  }

  return <div className="route-map-board" ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
