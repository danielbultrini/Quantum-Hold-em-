"use client"

import type { Game, Placement, SingleGate } from "@/lib/game"
import { HAND_CARDS } from "@/lib/game"
import { GATE_INFO } from "@/components/gate-tile"

export function TurnPanel({
  game,
  currentRound,
  activePlayer,
  remaining0,
  remaining1,
  placement,
  onPick,
  onResolve,
  onUndo,
}: {
  game: Game
  currentRound: number
  activePlayer: "p0" | "p1" | null
  remaining0: Record<string, number>
  remaining1: Record<string, number>
  placement: Placement
  onPick: (gate: SingleGate) => void
  onResolve: () => void
  onUndo: () => void
}) {
  const round = game.rounds[currentRound]
  const bothPlaced = placement.p0 !== null && placement.p1 !== null
  const activeRemaining = activePlayer === "p1" ? remaining1 : remaining0
  const activeQubit = activePlayer === "p1" ? round.p1Qubit : round.p0Qubit
  const accent = activePlayer === "p1" ? "p1" : "p0"

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Layer {currentRound + 1} of {game.numRounds}
          </p>
          {bothPlaced ? (
            <p className="mt-1 text-lg font-semibold">Both gates locked in</p>
          ) : (
            <p className="mt-1 text-lg font-semibold">
              <span className={activePlayer === "p1" ? "text-p1" : "text-p0"}>
                {activePlayer === "p1" ? "Player 1 · Ones" : "Player 0 · Zeros"}
              </span>{" "}
              <span className="text-muted">— place a gate on</span>{" "}
              <span className="font-mono">q{activeQubit}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(placement.p0 || placement.p1) && (
            <button
              onClick={onUndo}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Reset layer
            </button>
          )}
          {bothPlaced && (
            <button
              onClick={onResolve}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              {currentRound + 1 === game.numRounds ? "Resolve & measure" : "Resolve layer"}
            </button>
          )}
        </div>
      </div>

      {!bothPlaced && activePlayer && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {HAND_CARDS.map((gate) => {
            const count = activeRemaining[gate]
            const disabled = count <= 0
            return (
              <button
                key={gate}
                disabled={disabled}
                onClick={() => onPick(gate)}
                className={`group flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all ${
                  disabled
                    ? "cursor-not-allowed border-border/50 opacity-35"
                    : accent === "p1"
                      ? "border-p1/50 hover:border-p1 hover:bg-[color-mix(in_oklch,var(--color-p1)_12%,transparent)]"
                      : "border-p0/50 hover:border-p0 hover:bg-[color-mix(in_oklch,var(--color-p0)_12%,transparent)]"
                }`}
              >
                <span
                  className={`font-mono text-xl font-bold ${accent === "p1" ? "text-p1" : "text-p0"}`}
                >
                  {GATE_INFO[gate].label}
                </span>
                <span className="text-[11px] font-medium text-foreground">{GATE_INFO[gate].name}</span>
                <span className="text-[10px] leading-tight text-muted">{GATE_INFO[gate].desc}</span>
                <span className="mt-1 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted">
                  ×{count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {bothPlaced && (
        <p className="text-sm text-muted">
          Player 0 placed <GateBadge gate={placement.p0!} variant="p0" /> on q{round.p0Qubit}, Player 1 placed{" "}
          <GateBadge gate={placement.p1!} variant="p1" /> on q{round.p1Qubit}. Resolve to reveal this layer&apos;s
          fixed gates.
        </p>
      )}

      {/* Both hands summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <HandSummary title="Player 0 · Zeros" variant="p0" remaining={remaining0} />
        <HandSummary title="Player 1 · Ones" variant="p1" remaining={remaining1} />
      </div>
    </div>
  )
}

function GateBadge({ gate, variant }: { gate: SingleGate; variant: "p0" | "p1" }) {
  return (
    <span
      className={`inline-block rounded border px-1.5 font-mono text-xs font-bold ${
        variant === "p0" ? "border-p0/60 text-p0" : "border-p1/60 text-p1"
      }`}
    >
      {GATE_INFO[gate].label}
    </span>
  )
}

function HandSummary({
  title,
  variant,
  remaining,
}: {
  title: string
  variant: "p0" | "p1"
  remaining: Record<string, number>
}) {
  return (
    <div>
      <p className={`mb-1.5 text-[11px] font-medium uppercase tracking-wider ${variant === "p0" ? "text-p0" : "text-p1"}`}>
        {title}
      </p>
      <div className="flex flex-wrap gap-1">
        {HAND_CARDS.map((gate) => (
          <span
            key={gate}
            className={`rounded border px-1.5 py-0.5 font-mono text-[11px] ${
              remaining[gate] > 0 ? "border-border text-foreground" : "border-border/40 text-muted/40"
            }`}
          >
            {GATE_INFO[gate].label}
            <span className="text-muted">×{remaining[gate]}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
