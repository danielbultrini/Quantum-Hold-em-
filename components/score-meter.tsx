export function ScoreMeter({ onesScore }: { onesScore: number }) {
  const ones = Math.max(0, Math.min(100, onesScore))
  const zeros = 100 - ones
  const leader = ones > 50 ? "p1" : ones < 50 ? "p0" : "tie"

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
        <span>Measurement balance</span>
        <span className="font-mono normal-case tracking-normal">
          {leader === "tie" ? "Even" : leader === "p0" ? "Zeros lead" : "Ones lead"}
        </span>
      </div>

      <div className="relative h-8 w-full overflow-hidden rounded-lg border border-border bg-surface-2">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{
            width: `${zeros}%`,
            background: "color-mix(in oklch, var(--color-p0) 30%, transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 transition-[width] duration-500 ease-out"
          style={{
            width: `${ones}%`,
            background: "color-mix(in oklch, var(--color-p1) 30%, transparent)",
          }}
        />
        {/* center divider at 50% */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground/40" />
        <div className="relative flex h-full items-center justify-between px-3 font-mono text-sm">
          <span className="text-p0">{zeros.toFixed(1)}% · 0</span>
          <span className="text-p1">1 · {ones.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>Player 0 wants more 0s</span>
        <span>Player 1 wants more 1s</span>
      </div>
    </div>
  )
}
