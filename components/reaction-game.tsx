"use client"

import { useCallback, useRef, useState } from "react"
import { feedback } from "@/lib/feedback"
import type { SessionEvent } from "@/lib/types"

interface ReactionGameProps {
  onEvent: (event: SessionEvent) => void
}

interface TargetPos {
  x: number // percentage 0-100
  y: number // percentage 0-100
}

function randomPos(): TargetPos {
  // Keep target fully inside the padded bounded area.
  return {
    x: 14 + Math.random() * 72,
    y: 14 + Math.random() * 72,
  }
}

export function ReactionGame({ onEvent }: ReactionGameProps) {
  const [running, setRunning] = useState(false)
  const [target, setTarget] = useState<TargetPos | null>(null)
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const [flashMiss, setFlashMiss] = useState(false)
  const appearTimeRef = useRef<number>(0)

  const spawn = useCallback(() => {
    setTarget(randomPos())
    appearTimeRef.current = performance.now()
  }, [])

  const start = useCallback(() => {
    setRunning(true)
    setLastReaction(null)
    spawn()
  }, [spawn])

  const stop = useCallback(() => {
    setRunning(false)
    setTarget(null)
  }, [])

  const handleTargetHit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!running) return
      const reactionMs = Math.round(performance.now() - appearTimeRef.current)
      setLastReaction(reactionMs)
      feedback.hit()
      onEvent({ type: "reaction_hit", game: "reaction", timestamp: Date.now(), reactionMs })
      spawn()
    },
    [running, onEvent, spawn],
  )

  const handleAreaMiss = useCallback(() => {
    if (!running) return
    feedback.miss()
    setFlashMiss(true)
    setTimeout(() => setFlashMiss(false), 220)
    onEvent({ type: "reaction_miss", game: "reaction", timestamp: Date.now() })
  }, [running, onEvent])

  return (
    <section
      id="panel-reaction"
      role="tabpanel"
      aria-labelledby="tab-reaction"
      className="rounded-3xl border-4 border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Reaction Speed</h2>
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="min-h-20 rounded-2xl border-4 border-primary bg-primary px-8 text-2xl font-extrabold text-primary-foreground transition-transform active:scale-[0.97]"
          >
            {lastReaction === null ? "Start" : "Start Again"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="min-h-20 rounded-2xl border-4 border-border bg-surface-2 px-8 text-2xl font-extrabold text-foreground transition-transform active:scale-[0.97]"
          >
            Stop
          </button>
        )}
      </div>

      <p className="mb-5 min-h-8 text-xl font-semibold text-muted" role="status">
        {running
          ? "Tap the yellow circle as fast as you can!"
          : lastReaction !== null
            ? `Last reaction: ${lastReaction} ms. Press Start Again to continue.`
            : "Press Start, then tap the circle each time it appears."}
      </p>

      <div
        onClick={handleAreaMiss}
        role="application"
        aria-label="Reaction game play area"
        className={`relative h-[22rem] w-full overflow-hidden rounded-3xl border-[6px] transition-colors sm:h-[26rem] ${
          flashMiss ? "border-danger bg-danger/20" : "border-border bg-surface-2"
        }`}
      >
        {!running && (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-2xl font-bold text-muted text-balance">
              The target will appear here. Tap it quickly and accurately.
            </p>
          </div>
        )}

        {running && target && (
          <button
            type="button"
            onClick={handleTargetHit}
            aria-label="Target — tap now"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-primary-foreground bg-primary shadow-[0_0_0_6px_rgba(250,204,21,0.35)] animate-pop transition-transform active:scale-90 sm:h-32 sm:w-32"
          />
        )}
      </div>
    </section>
  )
}
