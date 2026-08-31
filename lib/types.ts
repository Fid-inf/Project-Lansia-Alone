export type GameTab = "memory" | "reaction" | "steady"

export type SessionEventType =
  | "memory_match"
  | "memory_mismatch"
  | "memory_complete"
  | "memory_level_up"
  | "memory_preview"
  | "reaction_hit"
  | "reaction_miss"
  | "steady_start"
  | "steady_point"
  | "steady_error"
  | "steady_complete"

export interface SessionEvent {
  type: SessionEventType
  game: GameTab
  timestamp: number
  level?: number
  x?: number
  y?: number
  reactionMs?: number
  movementMs?: number
  deviation?: number
  jitter?: number
  error?: string
}

export interface DerivedMetrics {
  currentLevel: number
  avgReaction: number | null
  pathRmse: number | null
  hitAccuracy: number | null
  hits: number
  misses: number
  totalRounds: number
  memoryErrors: number
  trajectory: Array<{ x: number; y: number }>
}

export type LogEvent = (event: SessionEvent) => void
