"use client"
import type { GameTab } from "@/lib/types"
const TABS: { id: GameTab; label: string; sub: string }[] = [{ id: "memory", label: "Memory Training", sub: "Cognitive" }, { id: "reaction", label: "Reaction Speed", sub: "Motoric" }, { id: "steady", label: "Steady Hand", sub: "Precision" }]
export function GameTabs({ activeTab, onChange }: { activeTab: GameTab; onChange: (tab: GameTab) => void }) { return <div role="tablist" aria-label="Choose a training game" className="tabs">{TABS.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={`tab ${activeTab === tab.id ? "active" : ""}`}><span>{tab.label}</span><small>{tab.sub}</small></button>)}</div> }
