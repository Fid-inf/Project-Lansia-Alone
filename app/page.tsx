"use client"

import { useCallback, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { GameTabs } from "@/components/game-tabs"
import { MemoryGame } from "@/components/memory-game"
import { ReactionGame } from "@/components/reaction-game"
import { MetricsPanel } from "@/components/metrics-panel"
import type { GameTab, SessionEvent } from "@/lib/types"

export default function Page() {
  const [highContrast, setHighContrast] = useState(false)
  const [activeTab, setActiveTab] = useState<GameTab>("memory")
  const [events, setEvents] = useState<SessionEvent[]>([])
  // Bump this key to force-remount the active game (Reset Game).
  const [resetToken, setResetToken] = useState(0)
  const [sessionStart] = useState(() => Date.now())

  const logEvent = useCallback((event: SessionEvent) => {
    setEvents((prev) => [...prev, event])
  }, [])

  const resetGame = useCallback(() => {
    setEvents([])
    setResetToken((n) => n + 1)
  }, [])

  const metrics = useMemo(() => deriveMetrics(events), [events])

  return (
    <div className={highContrast ? "hc min-h-screen" : "min-h-screen"}>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 pb-10 pt-4 sm:px-6">
        <Header
          highContrast={highContrast}
          onToggleContrast={() => setHighContrast((v) => !v)}
          onReset={resetGame}
        />

        <GameTabs activeTab={activeTab} onChange={setActiveTab} />

        <main aria-live="polite" className="flex flex-col gap-6">
          {activeTab === "memory" ? (
            <MemoryGame key={`memory-${resetToken}`} onEvent={logEvent} />
          ) : (
            <ReactionGame key={`reaction-${resetToken}`} onEvent={logEvent} />
          )}

          <MetricsPanel
            metrics={metrics}
            events={events}
            sessionStart={sessionStart}
            highContrast={highContrast}
            activeTab={activeTab}
          />
        </main>
      </div>
    </div>
  )
}

function deriveMetrics(events: SessionEvent[]) {
  const reactionTimes = events
    .filter((e) => e.type === "reaction_hit" && typeof e.reactionMs === "number")
    .map((e) => e.reactionMs as number)

  const hits = events.filter((e) => e.type === "reaction_hit").length
  const misses = events.filter((e) => e.type === "reaction_miss").length
  const totalClicks = hits + misses

  const lastReaction = reactionTimes.length ? reactionTimes[reactionTimes.length - 1] : null
  const avgReaction = reactionTimes.length
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : null
  const bestReaction = reactionTimes.length ? Math.min(...reactionTimes) : null

  const precisionRate = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : null

  const memoryRounds = events.filter((e) => e.type === "memory_complete").length
  const totalRounds = memoryRounds + hits

  return {
    lastReaction,
    avgReaction,
    bestReaction,
    hits,
    misses,
    precisionRate,
    memoryRounds,
    totalRounds,
  }
}
