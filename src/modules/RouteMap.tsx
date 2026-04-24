import { useEffect, useRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { RouteStop } from '../types'
import { attractions } from '../data/attractions/attractions'
import {
  createMarkerMarkup,
  createInfoWindowMarkup,
  createStationMarkerMarkup,
} from './AttractionsAmap'

const amapKey = import.meta.env.VITE_AMAP_KEY
const amapSecurityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE
const amapServiceHost = import.meta.env.VITE_AMAP_SERVICE_HOST

interface RouteMapProps {
  stops: RouteStop[]
  highlightStopId?: string | null
  onStopClick?: (stopId: string) => void
}

export function RouteMap({ stops, highlightStopId, onStopClick }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const amapRef = useRef<any | null>(null)
  const overlaysRef = useRef<any[]>([])
  const markerMapRef = useRef<Record<string, { marker: any; coord: [number, number]; attraction?: any }>>({})
  const infoWindowRef = useRef<any | null>(null)

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

        if (stops && stops.length) {
          // initial draw
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

  useEffect(() => {
    if (!mapRef.current || !amapRef.current) return
    drawForStops(stops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops])

  useEffect(() => {
    if (!mapRef.current || !amapRef.current) return
    if (highlightStopId) focusStop(highlightStopId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightStopId])

  function drawForStops(stopsList: RouteStop[]) {
    const map = mapRef.current
    const amap = amapRef.current
    if (!map || !amap) return

    try {
      if (overlaysRef.current.length) map.remove(overlaysRef.current)
    } catch {}
    overlaysRef.current = []
    markerMapRef.current = {}

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

    

    // draw single line; prefer native BezierCurve/Polyline with showDir
    const PRIMARY_COLOR = '#e0533b'
    let lineAdded = false
    try {
      if (typeof amap.BezierCurve !== 'undefined') {
        const bez = new amap.BezierCurve({
          path: coords,
          strokeColor: PRIMARY_COLOR,
          strokeWeight: 8,
          strokeOpacity: 0.96,
          lineJoin: 'round',
          lineCap: 'round',
          showDir: true,
        })
        map.add(bez)
        overlaysRef.current.push(bez)
        lineAdded = true
      }
    } catch {}

    if (!lineAdded) {
      const simpleLine = new amap.Polyline({
        path: coords,
        strokeColor: PRIMARY_COLOR,
        strokeWeight: 8,
        strokeOpacity: 0.96,
        lineJoin: 'round',
        lineCap: 'round',
        showDir: true,
      })
      map.add(simpleLine)
      overlaysRef.current.push(simpleLine)
    }

    // stop markers (reuse attraction markers)
    stopsList.forEach((stop, idx) => {
      const coord = coords[idx]
      if (!coord) return
      const order = stop.order ?? idx + 1

      const attraction = attractions.find((a) => a.id === stop.id)

      let content = ''
      if (attraction) {
        content = `<div class="route-marker-wrapper">${createMarkerMarkup(attraction, 'default')}<div class="route-marker-order">${String(order).padStart(2, '0')}</div></div>`
      } else {
        const stationName = stop.label ?? '站点'
        content = `<div class="route-marker-wrapper">${createStationMarkerMarkup(stationName)}<div class="route-marker-order">${String(order).padStart(2, '0')}</div></div>`
      }

      const marker = new amap.Marker({
        position: coord,
        content,
        offset: new amap.Pixel(-18, -48),
        zIndex: 150,
      })

      marker.on('click', () => {
        if (attraction) {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new amap.InfoWindow({
              anchor: 'bottom-center',
              offset: new amap.Pixel(0, -18),
              isCustom: true,
              autoMove: true,
              closeWhenClickMap: true,
            })
          }
          infoWindowRef.current.setContent(createInfoWindowMarkup(attraction))
          infoWindowRef.current.open(map, coord)
        }

        if (onStopClick) onStopClick(stop.id)
      })

      map.add(marker)
      overlaysRef.current.push(marker)

      markerMapRef.current[stop.id] = { marker, coord, attraction }
    })

    try {
      map.setFitView(overlaysRef.current, false, [72, 72, 72, 72])
    } catch {}
  }

  function focusStop(stopId: string) {
    const entry = markerMapRef.current[stopId]
    const map = mapRef.current
    const amap = amapRef.current
    if (!entry || !map || !amap) return

    const { coord, attraction } = entry
    try {
      map.setCenter(coord)
      map.setZoom(14)
    } catch {}

    if (attraction) {
      if (!infoWindowRef.current) {
        infoWindowRef.current = new amap.InfoWindow({
          anchor: 'bottom-center',
          offset: new amap.Pixel(0, -18),
          isCustom: true,
          autoMove: true,
          closeWhenClickMap: true,
        })
      }
      infoWindowRef.current.setContent(createInfoWindowMarkup(attraction))
      infoWindowRef.current.open(map, coord)
    }
  }

  return <div className="route-map-board" ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
