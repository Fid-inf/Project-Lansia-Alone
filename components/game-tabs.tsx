"use client"

import type { GameTab } from "@/lib/types"

interface GameTabsProps {
  activeTab: GameTab
  onChange: (tab: GameTab) => void
}

const TABS: { id: GameTab; label: string; sub: string }[] = [
  { id: "memory", label: "Memory Training", sub: "Cognitive" },
  { id: "reaction", label: "Reaction Speed", sub: "Motoric" },
]

export function GameTabs({ activeTab, onChange }: GameTabsProps) {
  return (
    <div role="tablist" aria-label="Choose a training game" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TABS.map((tab) => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border-4 px-6 transition-transform active:scale-[0.98] ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground"
            }`}
          >
            <span className="text-2xl font-extrabold">{tab.label}</span>
            <span
              className={`text-base font-semibold uppercase tracking-wide ${
                active ? "text-primary-foreground/80" : "text-muted"
              }`}
            >
              {tab.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
