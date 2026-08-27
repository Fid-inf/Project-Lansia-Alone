"use client"

import { useRef, useState } from "react"
import type { LogEvent } from "@/lib/types"

const WIDTH = 760
const HEIGHT = 420
const START = { x: 72, y: 330 }
const END = { x: 688, y: 105 }
const path = "M 72 330 C 130 70, 230 55, 315 275 S 500 390, 688 105"

function expectedY(x: number) {
  const t = Math.max(0, Math.min(1, (x - START.x) / (END.x - START.x)))
  return 330 - Math.sin(t * Math.PI) * 185 + Math.sin(t * Math.PI * 2) * 28
}

export function SteadyHandGame({ onEvent, audioGuide }: { onEvent: LogEvent; audioGuide: boolean }) {
  const [running, setRunning] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [cursor, setCursor] = useState(START)
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([])
  const [errors, setErrors] = useState(0)
  const startTime = useRef(0)

  const position = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(WIDTH, ((event.clientX - rect.left) / rect.width) * WIDTH)), y: Math.max(0, Math.min(HEIGHT, ((event.clientY - rect.top) / rect.height) * HEIGHT)) }
  }

  const track = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running || !drawing) return
    const point = position(event)
    setCursor(point)
    const deviation = Math.abs(point.y - expectedY(point.x))
    setPoints((current) => [...current.slice(-199), point])
    if (deviation > 38) {
      setErrors((value) => value + 1)
      onEvent({ type: "steady_error", game: "steady", timestamp: Date.now(), x: point.x, y: point.y, deviation, error: "off-path" })
    } else onEvent({ type: "steady_point", game: "steady", timestamp: Date.now(), x: point.x, y: point.y, deviation })
    if (point.x > END.x - 30 && Math.abs(point.y - END.y) < 42) finish()
  }

  const start = () => {
    setRunning(true); setDrawing(false); setCursor(START); setPoints([START]); setErrors(0); startTime.current = Date.now()
    if (audioGuide && typeof window !== "undefined") window.speechSynthesis?.speak(new SpeechSynthesisUtterance("Mulai dari titik hijau. Tekan dan tahan tombol kiri mouse, lalu ikuti jalur perlahan sampai titik akhir."))
  }

  function finish() {
    setRunning(false); setDrawing(false)
    onEvent({ type: "steady_complete", game: "steady", timestamp: Date.now(), movementMs: Date.now() - startTime.current, error: `${errors} errors` })
  }

  const begin = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running) return
    const point = position(event)
    if (Math.hypot(point.x - START.x, point.y - START.y) < 54) {
      setDrawing(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      track(event)
    }
  }

  return <section className="game-card" id="panel-steady" role="tabpanel">
    <div className="game-heading"><div><p className="eyebrow">MOTORIC / PRECISION</p><h2>Steady Hand</h2><p>Mulai dari titik hijau, tahan klik kiri, lalu ikuti jalur tanpa keluar batas.</p></div><button className="primary-button" onClick={running ? finish : start}>{running ? "Selesai" : "Mulai Jalur"}</button></div>
    <p className="status-line">{running ? drawing ? `Ikuti jalur dengan stabil. Kesalahan: ${errors}` : "Letakkan kursor di titik hijau, lalu tahan klik kiri untuk mulai." : "Latihan koordinasi tangan-mata dengan umpan balik langsung."}</p>
    <svg className="steady-canvas" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Jalur steady hand dari titik hijau ke titik akhir" onPointerDown={begin} onPointerMove={track} onPointerUp={(event) => { setDrawing(false); event.currentTarget.releasePointerCapture?.(event.pointerId) }} onPointerCancel={() => setDrawing(false)}>
      <path d={path} className="steady-track" />
      <circle cx={START.x} cy={START.y} r="28" className="steady-start" /><circle cx={END.x} cy={END.y} r="28" className="steady-end" />
      {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="steady-trace" />}
      <circle cx={cursor.x} cy={cursor.y} r="18" className="steady-cursor" />
    </svg>
  </section>
}
