"use client"

import { useCallback } from "react"
import type { DerivedMetrics, GameTab, SessionEvent } from "@/lib/types"

interface MetricsPanelProps {
  metrics: DerivedMetrics
  events: SessionEvent[]
  sessionStart: number
  highContrast: boolean
  activeTab: GameTab
}

export function MetricsPanel({
  metrics,
  events,
  sessionStart,
  highContrast,
  activeTab,
}: MetricsPanelProps) {
  const exportJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      sessionStart: new Date(sessionStart).toISOString(),
      sessionDurationMs: Date.now() - sessionStart,
      highContrastMode: highContrast,
      activeGame: activeTab,
      summary: {
        lastReactionMs: metrics.lastReaction,
        averageReactionMs: metrics.avgReaction,
        bestReactionMs: metrics.bestReaction,
        hits: metrics.hits,
        missedClicks: metrics.misses,
        precisionRatePct: metrics.precisionRate,
        memoryRoundsCompleted: metrics.memoryRounds,
        totalCompletedRounds: metrics.totalRounds,
      },
      events,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lansia-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [metrics, events, sessionStart, highContrast, activeTab])

  return (
    <section
      aria-label="Session metrics"
      className="rounded-3xl border-4 border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Session Metrics</h2>
          <p className="text-base font-semibold text-muted">Live data for research analysis</p>
        </div>
        <button
          type="button"
          onClick={exportJson}
          className="flex min-h-20 items-center justify-center gap-3 rounded-2xl border-4 border-primary bg-primary px-6 text-xl font-extrabold text-primary-foreground transition-transform active:scale-[0.97] sm:text-2xl"
        >
          <DownloadIcon />
          Export Session JSON
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Reaction Time"
          value={metrics.lastReaction !== null ? `${metrics.lastReaction}` : "—"}
          unit="ms"
          hint={metrics.avgReaction !== null ? `avg ${metrics.avgReaction} ms` : "no data yet"}
        />
        <MetricCard
          label="Precision Rate"
          value={metrics.precisionRate !== null ? `${metrics.precisionRate}` : "—"}
          unit="%"
          hint={`${metrics.misses} missed clicks`}
        />
        <MetricCard
          label="Completed Rounds"
          value={`${metrics.totalRounds}`}
          unit="rounds"
          hint={`${metrics.memoryRounds} memory · ${metrics.hits} targets`}
        />
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  unit,
  hint,
}: {
  label: string
  value: string
  unit: string
  hint: string
}) {
  return (
    <div className="flex flex-col rounded-2xl border-4 border-border bg-surface-2 p-5">
      <span className="text-lg font-bold uppercase tracking-wide text-muted">{label}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-black tabular-nums text-primary">{value}</span>
        <span className="text-xl font-bold text-muted">{unit}</span>
      </div>
      <span className="mt-2 text-base font-semibold text-muted">{hint}</span>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
