"use client"

import { useMemo, useState } from "react"
import { type Game, type Placement, type SingleGate, HAND_CARDS, emptyPlacements, generateGame, simulate } from "@/lib/game"
import { onesScore } from "@/lib/quantum"
import { SetupScreen } from "@/components/setup-screen"
import { CircuitBoard } from "@/components/circuit-board"
import { TurnPanel } from "@/components/turn-panel"
import { HandoffScreen } from "@/components/handoff-screen"
import { ScoreMeter } from "@/components/score-meter"
import { ProbabilityChart } from "@/components/probability-chart"
import { WinnerOverlay } from "@/components/winner-overlay"

type Phase = "setup" | "playing" | "finished"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("setup")
  const [game, setGame] = useState<Game | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [remaining0, setRemaining0] = useState<Record<string, number>>({})
  const [remaining1, setRemaining1] = useState<Record<string, number>>({})
  // When set, the device is being passed — hide the hand until the named player is ready.
  const [handoffTo, setHandoffTo] = useState<"p0" | "p1" | null>(null)

  function startGame(numQubits: number, numRounds: number) {
    const g = generateGame(numQubits, numRounds)
    setGame(g)
    setPlacements(emptyPlacements(numRounds))
    setCurrentRound(0)
    setRemaining0({ ...g.hand0 })
    setRemaining1({ ...g.hand1 })
    setHandoffTo("p0")
    setPhase("playing")
  }

  function replay() {
    if (!game) return
    startGame(game.numQubits, game.numRounds)
  }

  // Whose turn: Player 0 places first, then Player 1.
  const activePlayer: "p0" | "p1" | null = useMemo(() => {
    if (phase !== "playing" || !game) return null
    const p = placements[currentRound]
    if (!p) return null
    if (p.p0 === null) return "p0"
    if (p.p1 === null) return "p1"
    return null
  }, [phase, game, placements, currentRound])

  function pick(gate: SingleGate) {
    if (!game || !activePlayer) return
    setPlacements((prev) => {
      const next = prev.map((p) => ({ ...p }))
      next[currentRound][activePlayer] = gate
      return next
    })
    if (activePlayer === "p0") {
      setRemaining0((r) => ({ ...r, [gate]: r[gate] - 1 }))
      // Player 0 just moved — pass the device to Player 1.
      setHandoffTo("p1")
    } else {
      setRemaining1((r) => ({ ...r, [gate]: r[gate] - 1 }))
    }
  }

  function resetLayer() {
    if (!game) return
    const p = placements[currentRound]
    if (!p) return
    // Restore any placed cards back into the players' hands.
    if (p.p0) setRemaining0((r) => ({ ...r, [p.p0!]: r[p.p0!] + 1 }))
    if (p.p1) setRemaining1((r) => ({ ...r, [p.p1!]: r[p.p1!] + 1 }))
    setPlacements((prev) => {
      const next = prev.map((x) => ({ ...x }))
      next[currentRound] = { p0: null, p1: null }
      return next
    })
    // Back to Player 0's turn for this layer.
    setHandoffTo("p0")
  }

  function resolve() {
    if (!game) return
    const isLast = currentRound + 1 === game.numRounds
    if (isLast) {
      setPhase("finished")
    } else {
      setCurrentRound((r) => r + 1)
      // New layer starts with Player 0 — pass the device back.
      setHandoffTo("p0")
    }
  }

  // Live statevector: fully-resolved rounds + current in-progress placement preview.
  const state = useMemo(() => {
    if (!game) return null
    const resolvedRounds = phase === "finished" ? game.numRounds : currentRound
    const provisional = phase === "finished" ? undefined : placements[currentRound]
    return simulate(game, placements, resolvedRounds, provisional)
  }, [game, placements, currentRound, phase])

  const score = useMemo(() => {
    if (!game || !state) return 50
    return onesScore(state, game.numQubits)
  }, [game, state])

  if (phase === "setup" || !game || !state) {
    return (
      <main className="circuit-backdrop min-h-screen">
        <div className="mx-auto max-w-6xl px-4">
          <SetupScreen onStart={startGame} />
        </div>
      </main>
    )
  }

  return (
    <main className="circuit-backdrop min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quantum Hold&apos;em
            </h1>
            <p className="text-sm text-muted">
              {game.numQubits} qubits · {game.numRounds} layers ·{" "}
              <span className="text-p0">Zeros</span> vs <span className="text-p1">Ones</span>
            </p>
          </div>
          <button
            onClick={() => setPhase("setup")}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            New game
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Circuit</h2>
              <CircuitBoard
                game={game}
                placements={placements}
                currentRound={currentRound}
                phase={phase === "finished" ? "finished" : "playing"}
              />
            </section>

            {phase === "playing" && handoffTo && (
              <HandoffScreen
                player={handoffTo}
                round={currentRound}
                numRounds={game.numRounds}
                onReady={() => setHandoffTo(null)}
              />
            )}

            {phase === "playing" && !handoffTo && (
              <TurnPanel
                game={game}
                currentRound={currentRound}
                activePlayer={activePlayer}
                remaining0={remaining0}
                remaining1={remaining1}
                placement={placements[currentRound]}
                onPick={pick}
                onResolve={resolve}
                onUndo={resetLayer}
              />
            )}
          </div>

          <aside className="flex flex-col gap-5">
            <ScoreMeter onesScore={score} />
            <ProbabilityChart state={state} numQubits={game.numQubits} />
          </aside>
        </div>
      </div>

      {phase === "finished" && (
        <WinnerOverlay onesScore={score} onPlayAgain={replay} onNewGame={() => setPhase("setup")} />
      )}
    </main>
  )
}
