export const metersToDegLat = (m: number) => m / 111320

export const metersToDegLon = (m: number, lat: number) =>
  m / (111320 * Math.cos((lat * Math.PI) / 180))

export function disperseCoords(coords: [number, number][], radiusMeters = 18) {
  const groups = new Map<string, number[]>()

  coords.forEach((c, i) => {
    const key = `${c[0].toFixed(6)}|${c[1].toFixed(6)}`
    const arr = groups.get(key) ?? []
    arr.push(i)
    groups.set(key, arr)
  })

  const result: [number, number][] = coords.map((c) => [c[0], c[1]])

  groups.forEach((indices) => {
    if (indices.length <= 1) return

    const center = coords[indices[0]]
    const lat = center[1]

    indices.forEach((idx, j) => {
      const angle = (2 * Math.PI * j) / indices.length
      const dx = radiusMeters * Math.cos(angle)
      const dy = radiusMeters * Math.sin(angle)
      result[idx] = [center[0] + metersToDegLon(dx, lat), center[1] + metersToDegLat(dy)]
    })
  })

  return result
}

// 偏移线段（将线段按法向量平移 offsetMeters 米）
export function offsetSegment(segment: [number, number][], offsetMeters: number) {
  if (!segment || segment.length < 2) return segment
  const [a, b] = segment
  const avgLat = (a[1] + b[1]) / 2
  const lonPerMeter = 1 / (111320 * Math.cos((avgLat * Math.PI) / 180))
  const latPerMeter = 1 / 111320

  const vx = b[0] - a[0]
  const vy = b[1] - a[1]
  const len = Math.sqrt(vx * vx + vy * vy) || 1
  const nx = -vy / len
  const ny = vx / len

  const lonShift = nx * offsetMeters * lonPerMeter
  const latShift = ny * offsetMeters * latPerMeter

  return [
    [a[0] + lonShift, a[1] + latShift] as [number, number],
    [b[0] + lonShift, b[1] + latShift] as [number, number],
  ]
}

// 生成无序段 key（用于统计重复段）
export function unorderedSegmentKey(a: [number, number], b: [number, number]) {
  const k1 = `${a[0].toFixed(6)}|${a[1].toFixed(6)}`
  const k2 = `${b[0].toFixed(6)}|${b[1].toFixed(6)}`
  return k1 < k2 ? `${k1}__${k2}` : `${k2}__${k1}`
}
