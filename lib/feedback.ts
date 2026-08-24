// Lightweight audio + haptic feedback helpers.
// Audio uses the Web Audio API so no assets are required.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine") {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === "suspended") audio.resume().catch(() => {})
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + durationMs / 1000)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + durationMs / 1000)
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* ignore */
    }
  }
}

export const feedback = {
  success() {
    tone(660, 120)
    setTimeout(() => tone(880, 160), 110)
    vibrate([40, 30, 60])
  },
  hit() {
    tone(720, 90, "triangle")
    vibrate(35)
  },
  miss() {
    tone(180, 160, "sawtooth")
    vibrate([20, 40, 20])
  },
  flip() {
    tone(520, 60, "square")
    vibrate(15)
  },
  complete() {
    tone(523, 140)
    setTimeout(() => tone(659, 140), 130)
    setTimeout(() => tone(784, 220), 270)
    vibrate([60, 40, 120])
  },
}
