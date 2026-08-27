"use client"

interface HeaderProps {
  highContrast: boolean
  onToggleContrast: () => void
  onReset: () => void
}

export function Header({ highContrast, onToggleContrast, onReset }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b-4 border-border pb-5 pt-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-pretty text-3xl font-extrabold leading-tight sm:text-4xl">
          Latihan Otak &amp; Motorik
        </h1>
        <p className="text-lg font-medium text-muted sm:text-xl">
          Brain &amp; Motor Training for Seniors
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onToggleContrast}
          aria-pressed={highContrast}
          className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border-4 border-border bg-surface px-6 text-left transition-colors active:scale-[0.98]"
        >
          <span className="text-xl font-bold sm:text-2xl">High Contrast Mode</span>
          <span
            aria-hidden="true"
            className={`flex h-11 w-20 shrink-0 items-center rounded-full border-4 border-border px-1 transition-colors ${
              highContrast ? "bg-primary" : "bg-surface-2"
            }`}
          >
            <span
              className={`h-7 w-7 rounded-full bg-foreground transition-transform ${
                highContrast ? "translate-x-9" : "translate-x-0"
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex min-h-20 items-center justify-center gap-3 rounded-2xl border-4 border-primary bg-primary px-8 text-2xl font-extrabold text-primary-foreground transition-transform active:scale-[0.97] sm:text-2xl"
        >
          <ResetIcon />
          Reset Game
        </button>
      </div>
    </header>
  )
}

function ResetIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
