import { indexToBitstring, type StateVector, probabilities } from "@/lib/quantum"

export function ProbabilityChart({ state, numQubits }: { state: StateVector; numQubits: number }) {
  const probs = probabilities(state)
  const max = Math.max(...probs, 0.0001)

  // Keep the list readable: only show basis states with non-negligible weight,
  // always keeping at least the top handful.
  const entries = probs
    .map((p, i) => ({ p, i }))
    .filter((e) => e.p > 0.0005)
    .sort((a, b) => b.p - a.p)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
        <span>Outcome probabilities</span>
        <span className="font-mono normal-case tracking-normal">q0 → q{numQubits - 1}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {entries.map(({ p, i }) => {
          const bits = indexToBitstring(i, numQubits)
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="flex gap-0.5 font-mono text-xs">
                {bits.split("").map((b, idx) => (
                  <span key={idx} className={b === "0" ? "text-p0" : "text-p1"}>
                    {b}
                  </span>
                ))}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface-2">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-[width] duration-500 ease-out"
                  style={{
                    width: `${(p / max) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-accent-dim), var(--color-accent))",
                  }}
                />
              </div>
              <span className="w-12 text-right font-mono text-xs text-muted">{(p * 100).toFixed(1)}%</span>
            </div>
          )
        })}
        {entries.length === 0 && <p className="text-sm text-muted">No outcomes yet.</p>}
      </div>
    </div>
  )
}
