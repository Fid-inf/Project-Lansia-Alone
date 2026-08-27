"use client"

interface HeaderProps { highContrast: boolean; audioGuide: boolean; onToggleContrast: () => void; onToggleAudio: () => void; onReset: () => void }

export function Header({ highContrast, audioGuide, onToggleContrast, onToggleAudio, onReset }: HeaderProps) {
  return <header className="topbar"><div><p className="eyebrow">LANSIA TRAINING LAB</p><h1>Brain & Motor Training</h1><p className="subtitle">Latihan aman untuk otak dan gerak</p></div><div className="header-actions"><button className={`toggle ${audioGuide ? "selected" : ""}`} onClick={onToggleAudio} aria-pressed={audioGuide}>Audio Guide <span>{audioGuide ? "ON" : "OFF"}</span></button><button className={`toggle ${highContrast ? "selected" : ""}`} onClick={onToggleContrast} aria-pressed={highContrast}>High Contrast <span>{highContrast ? "ON" : "OFF"}</span></button><button className="reset-button" onClick={onReset}>Reset Session</button></div></header>
}
