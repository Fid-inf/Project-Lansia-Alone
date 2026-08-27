"use client"
import { useRef, useState } from "react"
import type { LogEvent } from "@/lib/types"

const START = { x: 40, y: 250 }
const END = { x: 380, y: 180 }
const path = "M 40 250 C 90 60, 150 60, 205 230 S 320 390, 380 180"

function expectedY(x: number) {
  const t = Math.max(0, Math.min(1, (x - START.x) / (END.x - START.x)))
  return 250 - Math.sin(t * Math.PI) * 145 + Math.sin(t * Math.PI * 2) * 22
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
    return { x: Math.max(0, Math.min(420, ((event.clientX - rect.left) / rect.width) * 420)), y: Math.max(0, Math.min(300, ((event.clientY - rect.top) / rect.height) * 300)) }
  }

  const track = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running || !drawing) return
    const point = position(event)
    setCursor(point)
    const deviation = Math.abs(point.y - expectedY(point.x))
    setPoints((current) => [...current.slice(-99), point])
    if (deviation > 28) {
      setErrors((value) => value + 1)
      onEvent({ type: "steady_error", game: "steady", timestamp: Date.now(), x: point.x, y: point.y, deviation, error: "off-path" })
    } else onEvent({ type: "steady_point", game: "steady", timestamp: Date.now(), x: point.x, y: point.y, deviation })
    if (point.x > END.x - 18 && Math.abs(point.y - END.y) < 28) finish()
  }

  const start = () => {
    setRunning(true); setDrawing(false); setCursor(START); setPoints([START]); setErrors(0); startTime.current = Date.now()
    if (audioGuide && typeof window !== "undefined") window.speechSynthesis?.speak(new SpeechSynthesisUtterance("Mulai dari titik hijau. Tekan dan ikuti jalur perlahan sampai titik akhir."))
  }

  function finish() {
    setRunning(false); setDrawing(false)
    onEvent({ type: "steady_complete", game: "steady", timestamp: Date.now(), movementMs: Date.now() - startTime.current, error: `${errors} errors` })
  }

  const begin = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!running) return
    const point = position(event)
    if (Math.hypot(point.x - START.x, point.y - START.y) < 36) { setDrawing(true); event.currentTarget.setPointerCapture(event.pointerId); track(event) }
  }

  return <section className="game-card" id="panel-steady" role="tabpanel">
    <div className="game-heading"><div><p className="eyebrow">MOTORIC / PRECISION</p><h2>Steady Hand</h2><p>Mulai dari titik hijau, lalu ikuti jalur tanpa keluar batas.</p></div><button className="primary-button" onClick={running ? finish : start}>{running ? "Selesai" : "Mulai Jalur"}</button></div>
    <p className="status-line">{running ? drawing ? `Ikuti jalur dengan stabil. Kesalahan: ${errors}` : "Letakkan kursor di titik hijau untuk mulai." : "Latihan koordinasi tangan-mata dengan umpan balik langsung."}</p>
    <svg className="steady-canvas" viewBox="0 0 420 300" role="img" aria-label="Jalur steady hand dari titik hijau ke titik akhir" onPointerDown={begin} onPointerMove={track} onPointerUp={() => setDrawing(false)}>
      <path d={path} className="steady-track" pathLength="1" />
      <circle cx={START.x} cy={START.y} r="22" className="steady-start" /><circle cx={END.x} cy={END.y} r="22" className="steady-end" />
      {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="steady-trace" />}
      <circle cx={cursor.x} cy={cursor.y} r="14" className="steady-cursor" />
    </svg>
  </section>
}
