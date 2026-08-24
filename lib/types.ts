export type GameTab = "memory" | "reaction"

export type SessionEventType =
  | "memory_match"
  | "memory_mismatch"
  | "memory_complete"
  | "reaction_hit"
  | "reaction_miss"

export interface SessionEvent {
  type: SessionEventType
  game: GameTab
  timestamp: number
  /** Reaction time in milliseconds (reaction_hit events only). */
  reactionMs?: number
}

export interface DerivedMetrics {
  lastReaction: number | null
  avgReaction: number | null
  bestReaction: number | null
  hits: number
  misses: number
  precisionRate: number | null
  memoryRounds: number
  totalRounds: number
}
