"use client"

import { useCallback, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { GameTabs } from "@/components/game-tabs"
import { MemoryGame } from "@/components/memory-game"
import { ReactionGame } from "@/components/reaction-game"
import { SteadyHandGame } from "@/components/steady-hand-game"
import { MetricsPanel } from "@/components/metrics-panel"
import type { GameTab, SessionEvent } from "@/lib/types"

export default function Page() {
  const [highContrast, setHighContrast] = useState(false)
  const [audioGuide, setAudioGuide] = useState(false)
  const [activeTab, setActiveTab] = useState<GameTab>("memory")
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [resetToken, setResetToken] = useState(0)
  const [sessionStart] = useState(() => Date.now())
  const logEvent = useCallback((event: SessionEvent) => setEvents((prev) => [...prev, event]), [])
  const resetSession = useCallback(() => { setEvents([]); setResetToken((n) => n + 1) }, [])
  const metrics = useMemo(() => deriveMetrics(events), [events])

  return <div className={highContrast ? "hc min-h-screen" : "min-h-screen"}>
    <div className="shell">
      <Header highContrast={highContrast} audioGuide={audioGuide} onToggleContrast={() => setHighContrast((v) => !v)} onToggleAudio={() => setAudioGuide((v) => !v)} onReset={resetSession} />
      <GameTabs activeTab={activeTab} onChange={setActiveTab} />
      <main aria-live="polite" className="main-content">
        {activeTab === "memory" && <MemoryGame key={`memory-${resetToken}`} onEvent={logEvent} audioGuide={audioGuide} />}
        {activeTab === "reaction" && <ReactionGame key={`reaction-${resetToken}`} onEvent={logEvent} audioGuide={audioGuide} />}
        {activeTab === "steady" && <SteadyHandGame key={`steady-${resetToken}`} onEvent={logEvent} audioGuide={audioGuide} />}
        <MetricsPanel metrics={metrics} events={events} sessionStart={sessionStart} activeTab={activeTab} />
      </main>
    </div>
  </div>
}

function deriveMetrics(events: SessionEvent[]) {
  const reactions = events.flatMap((e) => e.type === "reaction_hit" && e.reactionMs ? [e.reactionMs] : [])
  const hits = events.filter((e) => e.type === "reaction_hit").length
  const misses = events.filter((e) => e.type === "reaction_miss").length
  const deviations = events.flatMap((e) => e.type === "steady_point" && typeof e.deviation === "number" ? [e.deviation] : [])
  const points = events.filter((e) => e.x !== undefined && e.y !== undefined).slice(-80).map((e) => ({ x: e.x!, y: e.y! }))
  return { currentLevel: Math.max(1, ...events.filter((e) => e.level).map((e) => e.level!)), avgReaction: reactions.length ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : null, pathRmse: deviations.length ? Math.round(Math.sqrt(deviations.reduce((a, b) => a + b * b, 0) / deviations.length) * 10) / 10 : null, hitAccuracy: hits + misses ? Math.round(hits / (hits + misses) * 100) : null, hits, misses, totalRounds: events.filter((e) => e.type === "memory_complete" || e.type === "reaction_hit" || e.type === "steady_complete").length, memoryErrors: events.filter((e) => e.type === "memory_mismatch").length, trajectory: points }
}
