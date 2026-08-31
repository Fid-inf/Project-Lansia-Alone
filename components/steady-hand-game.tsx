"use client"

import { useRef, useState } from "react"
import type { LogEvent } from "@/lib/types"

const WIDTH = 760
const HEIGHT = 420

type SteadyLevel = {
  id: number
  start: { x: number; y: number }
  mid: { x: number; y: number }
  end: { x: number; y: number }
  firstControl1: { x: number; y: number }
  firstControl2: { x: number; y: number }
  secondControl1: { x: number; y: number }
  secondControl2: { x: number; y: number }
  tolerance: number
  label: string
}

const STEADY_LEVELS: SteadyLevel[] = [
  {
    id: 1,
    start: { x: 72, y: 330 },
    mid: { x: 315, y: 275 },
    end: { x: 688, y: 105 },
    firstControl1: { x: 130, y: 70 },
    firstControl2: { x: 230, y: 55 },
    secondControl1: { x: 500, y: 390 },
    secondControl2: { x: 620, y: 200 },
    tolerance: 38,
    label: "Level 1",
  },
  {
    id: 2,
    start: { x: 90, y: 306 },
    mid: { x: 332, y: 242 },
    end: { x: 670, y: 118 },
    firstControl1: { x: 150, y: 90 },
    firstControl2: { x: 255, y: 48 },
    secondControl1: { x: 470, y: 368 },
    secondControl2: { x: 600, y: 170 },
    tolerance: 30,
    label: "Level 2",
  },
  {
    id: 3,
    start: { x: 82, y: 298 },
    mid: { x: 358, y: 266 },
    end: { x: 680, y: 110 },
    firstControl1: { x: 138, y: 58 },
    firstControl2: { x: 240, y: 72 },
    secondControl1: { x: 500, y: 355 },
    secondControl2: { x: 610, y: 148 },
    tolerance: 24,
    label: "Level 3",
  },
]

function cubicBezierPoint(
  start: { x: number; y: number },
  c1: { x: number; y: number },
  c2: { x: number; y: number },
  end: { x: number; y: number },
  t: number,
) {
  const u = 1 - t
  return {
    x: u ** 3 * start.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * end.x,
    y: u ** 3 * start.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * end.y,
  }
}

function expectedY(level: SteadyLevel, x: number) {
  const clampedX = Math.max(level.start.x, Math.min(level.end.x, x))
  const segment = clampedX <= level.mid.x
    ? { start: level.start, c1: level.firstControl1, c2: level.firstControl2, end: level.mid }
    : { start: level.mid, c1: level.secondControl1, c2: level.secondControl2, end: level.end }

  let low = 0
  let high = 1
  for (let index = 0; index < 20; index += 1) {
    const mid = (low + high) / 2
    const point = cubicBezierPoint(segment.start, segment.c1, segment.c2, segment.end, mid)
    if (point.x < clampedX) low = mid
    else high = mid
  }

  const t = (low + high) / 2
  const point = cubicBezierPoint(segment.start, segment.c1, segment.c2, segment.end, t)
  return point.y
}

function buildPath(level: SteadyLevel) {
  return `M ${level.start.x} ${level.start.y} C ${level.firstControl1.x} ${level.firstControl1.y}, ${level.firstControl2.x} ${level.firstControl2.y}, ${level.mid.x} ${level.mid.y} C ${level.secondControl1.x} ${level.secondControl1.y}, ${level.secondControl2.x} ${level.secondControl2.y}, ${level.end.x} ${level.end.y}`
}

export function SteadyHandGame({ onEvent, audioGuide }: { onEvent: LogEvent; audioGuide: boolean }) {
  const [level, setLevel] = useState(1)
  const [running, setRunning] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [cursor, setCursor] = useState(STEADY_LEVELS[0].start)
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([])
  const [errors, setErrors] = useState(0)
  const startTime = useRef(0)
  const currentLevel = STEADY_LEVELS[Math.min(level - 1, STEADY_LEVELS.length - 1)]

  const position = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(WIDTH, ((event.clientX - rect.left) / rect.width) * WIDTH)), y: Math.max(0, Math.min(HEIGHT, ((event.clientY - rect.top) / rect.height) * HEIGHT)) }
  }

  const track = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running || !drawing) return
    const point = position(event)
    setCursor(point)
    const deviation = Math.abs(point.y - expectedY(currentLevel, point.x))
    setPoints((current) => [...current.slice(-199), point])
    if (deviation > currentLevel.tolerance) {
      setErrors((value) => value + 1)
      onEvent({ type: "steady_error", game: "steady", level, timestamp: Date.now(), x: point.x, y: point.y, deviation, error: "off-path" })
    } else onEvent({ type: "steady_point", game: "steady", level, timestamp: Date.now(), x: point.x, y: point.y, deviation })

    if (Math.hypot(point.x - currentLevel.end.x, point.y - currentLevel.end.y) < 42) finish()
  }

  const start = () => {
    setRunning(true)
    setDrawing(false)
    setCursor(currentLevel.start)
    setPoints([currentLevel.start])
    setErrors(0)
    startTime.current = Date.now()
    onEvent({ type: "steady_start", game: "steady", level, timestamp: Date.now() })
    if (audioGuide && typeof window !== "undefined") window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`Level ${level}. Mulai dari titik hijau. Tekan dan tahan mouse, lalu ikuti jalur sampai titik akhir.`))
  }

  function finish() {
    setRunning(false)
    setDrawing(false)
    onEvent({ type: "steady_complete", game: "steady", level, timestamp: Date.now(), movementMs: Date.now() - startTime.current, error: `${errors} errors` })
    setLevel((value) => (value < STEADY_LEVELS.length ? value + 1 : 1))
  }

  const begin = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running) return
    const point = position(event)
    if (Math.hypot(point.x - currentLevel.start.x, point.y - currentLevel.start.y) < 54) {
      setDrawing(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      track(event)
    }
  }

  return <section className="game-card" id="panel-steady" role="tabpanel">
    <div className="game-heading"><div><p className="eyebrow">MOTORIC / PRECISION</p><h2>Steady Hand</h2><p>{currentLevel.label}: mulai dari titik hijau, tahan klik kiri, lalu ikuti jalur tanpa keluar batas.</p></div><button className="primary-button" onClick={running ? finish : start}>{running ? "Selesai" : `Mulai ${currentLevel.label}`}</button></div>
    <p className="status-line">{running ? drawing ? `Ikuti jalur ${currentLevel.label}. Kesalahan: ${errors}` : "Letakkan kursor di titik hijau, lalu tahan klik kiri untuk mulai." : "Latihan koordinasi tangan-mata dengan level yang makin sulit tiap selesai."}</p>
    <svg className="steady-canvas" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Jalur steady hand dari titik hijau ke titik akhir" onPointerDown={begin} onPointerMove={track} onPointerUp={(event) => { setDrawing(false); event.currentTarget.releasePointerCapture?.(event.pointerId) }} onPointerCancel={() => setDrawing(false)}>
      <path d={buildPath(currentLevel)} className="steady-track" />
      <circle cx={currentLevel.start.x} cy={currentLevel.start.y} r="28" className="steady-start" /><circle cx={currentLevel.end.x} cy={currentLevel.end.y} r="28" className="steady-end" />
      {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="steady-trace" />}
      <circle cx={cursor.x} cy={cursor.y} r="18" className="steady-cursor" />
    </svg>
  </section>
}
