"use client"

import { useCallback, useEffect, useState } from "react"
import { feedback } from "@/lib/feedback"
import type { SessionEvent } from "@/lib/types"
import { ShapeIcon, SHAPES, type ShapeId } from "@/components/shape-icon"

interface MemoryGameProps {
  onEvent: (event: SessionEvent) => void
}

interface Card {
  id: number
  shape: ShapeId
  color: string
  matched: boolean
}

const SHAPE_COLORS: Record<ShapeId, string> = {
  circle: "#38bdf8",
  square: "#f472b6",
  triangle: "#facc15",
  star: "#a78bfa",
  heart: "#f87171",
  diamond: "#34d399",
}

function buildDeck(): Card[] {
  // Pick 2 distinct shapes for a 2x2 grid (2 pairs).
  const pool = [...SHAPES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const chosen = pool.slice(0, 2)
  const deck: Card[] = []
  chosen.forEach((shape, index) => {
    deck.push({ id: index * 2, shape, color: SHAPE_COLORS[shape], matched: false })
    deck.push({ id: index * 2 + 1, shape, color: SHAPE_COLORS[shape], matched: false })
  })
  // shuffle placement
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function MemoryGame({ onEvent }: MemoryGameProps) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState("Tap two cards to find a matching pair.")
  const [justCompleted, setJustCompleted] = useState(false)

  const allMatched = deck.every((c) => c.matched)

  const handleFlip = useCallback(
    (index: number) => {
      if (locked) return
      if (flipped.includes(index)) return
      if (deck[index].matched) return

      feedback.flip()
      const next = [...flipped, index]
      setFlipped(next)

      if (next.length === 2) {
        setLocked(true)
        const [a, b] = next
        const isMatch = deck[a].shape === deck[b].shape

        if (isMatch) {
          setTimeout(() => {
            setDeck((prev) =>
              prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)),
            )
            setFlipped([])
            setLocked(false)
            setStatus("Match! Well done.")
            feedback.success()
            onEvent({ type: "memory_match", game: "memory", timestamp: Date.now() })
          }, 450)
        } else {
          setStatus("Not a match. Try again.")
          onEvent({ type: "memory_mismatch", game: "memory", timestamp: Date.now() })
          setTimeout(() => {
            setFlipped([])
            setLocked(false)
          }, 900)
        }
      }
    },
    [deck, flipped, locked, onEvent],
  )

  // When the board is cleared, log a completed round and start a new one.
  useEffect(() => {
    if (allMatched && !justCompleted) {
      setJustCompleted(true)
      setStatus("Round complete! Starting a new board...")
      feedback.complete()
      onEvent({ type: "memory_complete", game: "memory", timestamp: Date.now() })
      const t = setTimeout(() => {
        setDeck(buildDeck())
        setFlipped([])
        setLocked(false)
        setJustCompleted(false)
        setStatus("Tap two cards to find a matching pair.")
      }, 1400)
      return () => clearTimeout(t)
    }
  }, [allMatched, justCompleted, onEvent])

  return (
    <section
      id="panel-memory"
      role="tabpanel"
      aria-labelledby="tab-memory"
      className="rounded-3xl border-4 border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Memory Training</h2>
        <p className="hidden text-lg font-semibold text-muted sm:block" aria-hidden="true">
          Match the shapes
        </p>
      </div>

      <p className="mb-5 min-h-8 text-xl font-semibold text-muted" role="status">
        {status}
      </p>

      <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 sm:gap-6">
        {deck.map((card, index) => {
          const isUp = flipped.includes(index) || card.matched
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(index)}
              aria-label={isUp ? `${card.shape} card` : "Hidden card, tap to reveal"}
              disabled={card.matched || locked}
              className={`flex aspect-square min-h-40 w-full items-center justify-center rounded-3xl border-[6px] transition-transform active:scale-[0.97] ${
                card.matched
                  ? "border-success bg-surface-2 animate-pop"
                  : isUp
                    ? "border-primary bg-surface-2"
                    : "border-border bg-surface-2"
              }`}
            >
              {isUp ? (
                <ShapeIcon shape={card.shape} color={card.color} className="h-24 w-24 sm:h-28 sm:w-28" />
              ) : (
                <span className="text-6xl font-black text-muted" aria-hidden="true">
                  ?
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
