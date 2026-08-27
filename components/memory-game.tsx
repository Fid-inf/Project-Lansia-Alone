"use client"
import { useEffect, useState } from "react"
import type { LogEvent } from "@/lib/types"

const SHAPES = ["●", "▲", "■", "◆", "★", "+"]

export function MemoryGame({ onEvent, audioGuide }: { onEvent: LogEvent; audioGuide: boolean }) {
  const [level, setLevel] = useState(1)
  const [ready, setReady] = useState(false)
  const [preview, setPreview] = useState(3)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const pairs = Math.min(2 + level, 6)
  const cols = pairs <= 2 ? 2 : pairs <= 3 ? 3 : 4
  const [deck, setDeck] = useState<string[]>(() => makeDeck(3))
  const isPreviewing = !ready && preview > 0

  function makeDeck(pairCount: number) {
    return [...Array.from({ length: pairCount }, (_, i) => SHAPES[i]), ...Array.from({ length: pairCount }, (_, i) => SHAPES[i])].sort(() => Math.random() - 0.5)
  }

  useEffect(() => {
    if (!ready && preview > 0) {
      const timer = setTimeout(() => setPreview((value) => value - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [preview, ready])

  useEffect(() => {
    if (audioGuide && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Ingat bentuk dan posisi kartu. Setelah hitungan selesai, cari pasangan yang sama."))
  }, [audioGuide])

  const choose = (index: number) => {
    if (!ready || flipped.includes(index) || matched.includes(index) || flipped.length === 2) return
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length !== 2) return
    const correct = deck[next[0]] === deck[next[1]]
    onEvent({ type: correct ? "memory_match" : "memory_mismatch", game: "memory", timestamp: Date.now(), level, error: correct ? undefined : "mismatch" })
    setTimeout(() => {
      if (correct) {
        const all = [...matched, ...next]
        setMatched(all)
        if (all.length === deck.length) {
          onEvent({ type: "memory_complete", game: "memory", timestamp: Date.now(), level })
          if (level < 5) {
            setLevel((value) => value + 1)
            setDeck(makeDeck(Math.min(3 + level, 6)))
            setMatched([])
            setReady(false)
            setPreview(3)
          }
        }
      }
      setFlipped([])
    }, 650)
  }

  const restart = () => {
    setDeck(makeDeck(pairs))
    setMatched([])
    setFlipped([])
    setReady(false)
    setPreview(3)
  }

  return <section className="game-card" id="panel-memory" role="tabpanel">
    <div className="game-heading"><div><p className="eyebrow">COGNITIVE / LEVEL {level}</p><h2>Memory Training</h2><p>Perhatikan bentuk dan posisinya. Setelah kartu tertutup, temukan pasangan yang sama.</p></div><button className="secondary-button" onClick={restart}>Mulai Ulang</button></div>
    <div className="memory-status" aria-live="polite">{isPreviewing ? `Hafalkan bentuk: ${preview}` : !ready ? <button className="ready-button" onClick={() => setReady(true)}>Saya Siap</button> : `${matched.length / 2} dari ${pairs} pasangan cocok`}</div>
    <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>{deck.map((shape, index) => { const revealed = isPreviewing || flipped.includes(index) || matched.includes(index); return <button key={index} className={`memory-card ${revealed ? "revealed" : ""}`} onClick={() => choose(index)} aria-label={`Kartu ${index + 1}${revealed ? `, bentuk ${shape}` : ", tertutup"}`}><span>{revealed ? shape : "?"}</span></button> })}</div>
  </section>
}

function makeDeck(pairCount: number) {
  return [...Array.from({ length: pairCount }, (_, i) => SHAPES[i]), ...Array.from({ length: pairCount }, (_, i) => SHAPES[i])].sort(() => Math.random() - 0.5)
}
