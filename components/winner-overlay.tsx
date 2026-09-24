"use client"

export function WinnerOverlay({
  onesScore,
  onPlayAgain,
  onNewGame,
}: {
  onesScore: number
  onPlayAgain: () => void
  onNewGame: () => void
}) {
  const ones = onesScore
  const zeros = 100 - onesScore
  const winner = ones > 50 ? "p1" : ones < 50 ? "p0" : "tie"

  const title = winner === "tie" ? "Perfectly balanced" : winner === "p0" ? "Player 0 wins" : "Player 1 wins"
  const subtitle =
    winner === "tie"
      ? "The measurement is a dead heat."
      : winner === "p0"
        ? "Zeros dominate the final measurement."
        : "Ones dominate the final measurement."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in-fade">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Circuit measured</p>
        <h2
          className={`mt-2 text-3xl font-bold ${
            winner === "p0" ? "text-p0" : winner === "p1" ? "text-p1" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        <p className="mt-2 text-muted">{subtitle}</p>

        <div className="mt-6 flex items-center justify-center gap-6">
          <ScoreStat label="Zeros" value={zeros} variant="p0" lead={winner === "p0"} />
          <div className="text-2xl text-muted">vs</div>
          <ScoreStat label="Ones" value={ones} variant="p1" lead={winner === "p1"} />
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-background transition-opacity hover:opacity-90"
          >
            Play again
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-surface-2"
          >
            New setup
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoreStat({
  label,
  value,
  variant,
  lead,
}: {
  label: string
  value: number
  variant: "p0" | "p1"
  lead: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${lead ? (variant === "p0" ? "border-p0" : "border-p1") : "border-border"}`}>
      <p className={`font-mono text-3xl font-bold ${variant === "p0" ? "text-p0" : "text-p1"}`}>{value.toFixed(1)}%</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  )
}
