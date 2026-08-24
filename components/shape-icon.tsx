export const SHAPES = ["circle", "square", "triangle", "star", "heart", "diamond"] as const
export type ShapeId = (typeof SHAPES)[number]

interface ShapeIconProps {
  shape: ShapeId
  color: string
  className?: string
}

export function ShapeIcon({ shape, color, className }: ShapeIconProps) {
  const common = {
    fill: color,
    stroke: "#0f172a",
    strokeWidth: 4,
    strokeLinejoin: "round" as const,
  }
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-hidden="true">
      {shape === "circle" && <circle cx="50" cy="50" r="40" {...common} />}
      {shape === "square" && <rect x="14" y="14" width="72" height="72" rx="8" {...common} />}
      {shape === "triangle" && <polygon points="50,12 90,86 10,86" {...common} />}
      {shape === "star" && (
        <polygon
          points="50,8 61,38 93,38 67,58 77,90 50,70 23,90 33,58 7,38 39,38"
          {...common}
        />
      )}
      {shape === "heart" && (
        <path
          d="M50 86 L18 54 C6 42 6 22 24 18 C36 15 46 24 50 32 C54 24 64 15 76 18 C94 22 94 42 82 54 Z"
          {...common}
        />
      )}
      {shape === "diamond" && <polygon points="50,10 88,50 50,90 12,50" {...common} />}
    </svg>
  )
}
