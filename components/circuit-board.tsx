import type { Game, Placement } from "@/lib/game"
import { GateGlyph } from "@/components/gate-tile"

const LABEL_W = 46
const CELL_W = 76
const CELL_H = 66
const GATE = 44
const HEADER_H = 26

export function CircuitBoard({
  game,
  placements,
  currentRound,
  phase,
}: {
  game: Game
  placements: Placement[]
  currentRound: number
  phase: "playing" | "finished"
}) {
  const numCols = 1 + game.numRounds // init + one column per round
  const boardW = LABEL_W + numCols * CELL_W
  const boardH = game.numQubits * CELL_H

  const cellStyle = (col: number, q: number) => ({
    left: LABEL_W + col * CELL_W + (CELL_W - GATE) / 2,
    top: q * CELL_H + (CELL_H - GATE) / 2,
    width: GATE,
    height: GATE,
  })

  return (
    <div className="overflow-x-auto pb-2">
      <div style={{ width: boardW }} className="min-w-full">
        {/* Column headers */}
        <div className="flex" style={{ height: HEADER_H }}>
          <div style={{ width: LABEL_W }} />
          {Array.from({ length: numCols }).map((_, col) => {
            const isCurrent = phase === "playing" && col === currentRound + 1
            return (
              <div
                key={col}
                style={{ width: CELL_W }}
                className={`text-center text-[11px] font-medium uppercase tracking-wider ${
                  isCurrent ? "text-accent" : "text-muted/70"
                }`}
              >
                {col === 0 ? "init" : `L${col}`}
              </div>
            )
          })}
        </div>

        {/* Board */}
        <div className="relative" style={{ height: boardH, width: boardW }}>
          {/* Current-round column highlight */}
          {phase === "playing" && currentRound < game.numRounds && (
            <div
              className="absolute rounded-lg border border-accent/40 bg-accent/5"
              style={{
                left: LABEL_W + (currentRound + 1) * CELL_W + 4,
                top: 2,
                width: CELL_W - 8,
                height: boardH - 4,
              }}
            />
          )}

          {/* Qubit wires + labels */}
          {Array.from({ length: game.numQubits }).map((_, q) => (
            <div key={`wire-${q}`}>
              <div
                className="absolute font-mono text-sm text-muted"
                style={{ left: 0, top: q * CELL_H, width: LABEL_W, height: CELL_H, lineHeight: `${CELL_H}px` }}
              >
                q{q}
              </div>
              <div
                className="absolute bg-border"
                style={{ left: LABEL_W, top: q * CELL_H + CELL_H / 2 - 1, width: boardW - LABEL_W, height: 2 }}
              />
            </div>
          ))}

          {/* Init column: Hadamard on every qubit */}
          {Array.from({ length: game.numQubits }).map((_, q) => (
            <div key={`init-${q}`} className="absolute" style={cellStyle(0, q)}>
              <GateGlyph gate="H" variant="init" />
            </div>
          ))}

          {/* Round columns */}
          {game.rounds.map((round, r) => {
            const col = r + 1
            const placement = placements[r]
            const isPast = phase === "finished" || r < currentRound
            const isCurrent = phase === "playing" && r === currentRound
            const dim = !isPast && !isCurrent ? "opacity-55" : ""

            const elements: React.ReactNode[] = []

            // CX vertical connectors (drawn behind gate tiles)
            for (const g of round.fixed) {
              if (g.type === "CX" && g.control !== undefined) {
                const top = Math.min(g.control, g.target) * CELL_H + CELL_H / 2
                const height = Math.abs(g.control - g.target) * CELL_H
                elements.push(
                  <div
                    key={`cxline-${r}`}
                    className={`absolute bg-accent ${dim}`}
                    style={{ left: LABEL_W + col * CELL_W + CELL_W / 2 - 1, top, width: 2, height }}
                  />,
                )
              }
            }

            for (let q = 0; q < game.numQubits; q++) {
              const key = `cell-${r}-${q}`
              if (q === round.p0Qubit) {
                elements.push(
                  <div key={key} className={`absolute ${dim}`} style={cellStyle(col, q)}>
                    {placement?.p0 ? (
                      <GateGlyph gate={placement.p0} variant="p0" pop={isCurrent} />
                    ) : (
                      <Slot variant="p0" />
                    )}
                  </div>,
                )
                continue
              }
              if (q === round.p1Qubit) {
                elements.push(
                  <div key={key} className={`absolute ${dim}`} style={cellStyle(col, q)}>
                    {placement?.p1 ? (
                      <GateGlyph gate={placement.p1} variant="p1" pop={isCurrent} />
                    ) : (
                      <Slot variant="p1" />
                    )}
                  </div>,
                )
                continue
              }

              const targetGate = round.fixed.find((g) => g.target === q)
              const controlGate = round.fixed.find((g) => g.control === q)

              if (targetGate) {
                elements.push(
                  <div key={key} className={`absolute ${dim}`} style={cellStyle(col, q)}>
                    {targetGate.type === "CX" ? (
                      <CxTarget />
                    ) : (
                      <GateGlyph gate={targetGate.type} variant="fixed" />
                    )}
                  </div>,
                )
              } else if (controlGate) {
                elements.push(
                  <div
                    key={key}
                    className={`absolute flex items-center justify-center ${dim}`}
                    style={cellStyle(col, q)}
                  >
                    <div className="h-3.5 w-3.5 rounded-full bg-accent" />
                  </div>,
                )
              }
            }

            return <div key={`round-${r}`}>{elements}</div>
          })}
        </div>
      </div>
    </div>
  )
}

function Slot({ variant }: { variant: "p0" | "p1" }) {
  const color = variant === "p0" ? "text-p0/70 border-p0/60" : "text-p1/70 border-p1/60"
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-md border border-dashed font-mono text-xs font-semibold ${color}`}
    >
      {variant === "p0" ? "P0" : "P1"}
    </div>
  )
}

function CxTarget() {
  return (
    <div className="flex h-11 w-11 items-center justify-center">
      <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-accent">
        <div className="absolute h-full w-0.5 bg-accent" />
        <div className="absolute h-0.5 w-full bg-accent" />
      </div>
    </div>
  )
}
