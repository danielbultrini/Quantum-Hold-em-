"use client"

export function HandoffScreen({
  player,
  round,
  numRounds,
  onReady,
}: {
  player: "p0" | "p1"
  round: number
  numRounds: number
  onReady: () => void
}) {
  const isP1 = player === "p1"
  const accent = isP1 ? "p1" : "p0"
  const name = isP1 ? "Player 1" : "Player 0"
  const goal = isP1 ? "the most 1s" : "the most 0s"

  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center animate-in-fade">
      <p className="text-xs uppercase tracking-wider text-muted">
        Layer {round + 1} of {numRounds}
      </p>
      <div
        className={`mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-2xl font-bold ${
          isP1 ? "border-p1 text-p1" : "border-p0 text-p0"
        }`}
      >
        {isP1 ? "P1" : "P0"}
      </div>
      <h2 className="mt-4 text-2xl font-bold">
        Pass the device to{" "}
        <span className={isP1 ? "text-p1" : "text-p0"}>{name}</span>
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-pretty leading-relaxed text-muted">
        Hidden hands stay secret. When {name} is holding the device, reveal the hand and choose a gate — aiming for{" "}
        <span className={isP1 ? "text-p1 font-medium" : "text-p0 font-medium"}>{goal}</span>.
      </p>
      <button
        onClick={onReady}
        className={`mt-6 rounded-xl px-8 py-3 text-base font-semibold text-background transition-opacity hover:opacity-90 ${
          isP1 ? "bg-p1" : "bg-p0"
        }`}
      >
        {`I'm ${name} — reveal my hand`}
      </button>
    </div>
  )
}
