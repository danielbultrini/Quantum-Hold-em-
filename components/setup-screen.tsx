"use client"

import { useState } from "react"

export function SetupScreen({ onStart }: { onStart: (numQubits: number, numRounds: number) => void }) {
  const [numQubits, setNumQubits] = useState(4)
  const [numRounds, setNumRounds] = useState(4)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-8 py-10 text-center animate-in-fade">
      <div>
        <p className="mb-2 font-mono text-sm uppercase tracking-[0.3em] text-accent">Quantum Poker</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Quantum Hold&apos;em</h1>
        <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted">
          Two players duel over a shared quantum circuit. Take turns dropping gate cards into the blank slots of each
          layer. When the circuit is measured, <span className="text-p0 font-medium">Player 0</span> wins with more{" "}
          <span className="text-p0 font-medium">0</span>s and <span className="text-p1 font-medium">Player 1</span> wins
          with more <span className="text-p1 font-medium">1</span>s.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface p-6 text-left">
        <Stepper
          label="Qubits"
          hint="Width of the circuit"
          value={numQubits}
          min={2}
          max={6}
          onChange={setNumQubits}
        />
        <div className="my-5 h-px bg-border" />
        <Stepper
          label="Layers"
          hint="Turns each player takes"
          value={numRounds}
          min={2}
          max={8}
          onChange={setNumRounds}
        />
      </div>

      <button
        onClick={() => onStart(numQubits, numRounds)}
        className="rounded-xl bg-accent px-8 py-3 text-base font-semibold text-background transition-opacity hover:opacity-90"
      >
        Deal the circuit
      </button>
    </div>
  )
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg transition-colors hover:bg-surface-2 disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-xl font-bold">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg transition-colors hover:bg-surface-2 disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
