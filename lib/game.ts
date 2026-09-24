import {
  type GateType,
  type SingleGate,
  type StateVector,
  applyCX,
  applySingleGate,
  initState,
} from "./quantum"

export type { GateType, SingleGate }

export const HAND_CARDS: SingleGate[] = ["H", "HZ", "X", "Z", "I"]

export interface FixedGate {
  type: GateType
  target: number
  control?: number
}

export interface Round {
  p0Qubit: number
  p1Qubit: number
  fixed: FixedGate[]
}

export interface Game {
  numQubits: number
  numRounds: number
  rounds: Round[]
  hand0: Record<string, number>
  hand1: Record<string, number>
}

export interface Placement {
  p0: SingleGate | null
  p1: SingleGate | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomInt(n: number): number {
  return Math.floor(Math.random() * n)
}

// Build a random pre-populated layer of fixed gates (some qubits stay empty).
function generateFixedLayer(numQubits: number, reserved: number[]): FixedGate[] {
  const pool: (GateType | "Id")[] = ["H", "HZ", "X", "Z", "CX", "Id", "Id", "Id"]
  const fixed: FixedGate[] = []
  // A qubit can hold at most one thing per layer, so track everything used.
  const occupied = new Set<number>(reserved)
  for (let q = 0; q < numQubits; q++) {
    if (occupied.has(q)) continue
    const choice = pool[randomInt(pool.length)]
    if (choice === "Id") continue
    if (choice === "CX") {
      const candidates: number[] = []
      for (let c = 0; c < numQubits; c++) {
        if (c !== q && !occupied.has(c)) candidates.push(c)
      }
      if (candidates.length === 0) continue
      const control = candidates[randomInt(candidates.length)]
      fixed.push({ type: "CX", target: q, control })
      occupied.add(q)
      occupied.add(control)
    } else {
      fixed.push({ type: choice, target: q })
      occupied.add(q)
    }
  }
  return fixed
}

function distributeHands(numRounds: number): { hand0: Record<string, number>; hand1: Record<string, number> } {
  const deck: SingleGate[] = []
  for (let i = 0; i < numRounds; i++) deck.push(...HAND_CARDS)
  const shuffled = shuffle(deck)
  const handSize = numRounds + 1
  const toCounts = (cards: SingleGate[]) => {
    const counts: Record<string, number> = {}
    for (const c of HAND_CARDS) counts[c] = 0
    for (const c of cards) counts[c] += 1
    return counts
  }
  return {
    hand0: toCounts(shuffled.slice(0, handSize)),
    hand1: toCounts(shuffled.slice(handSize, handSize * 2)),
  }
}

export function generateGame(numQubits: number, numRounds: number): Game {
  const rounds: Round[] = []
  for (let r = 0; r < numRounds; r++) {
    // Pick two distinct qubits for the player slots.
    const qubits = shuffle(Array.from({ length: numQubits }, (_, i) => i))
    const p0Qubit = qubits[0]
    const p1Qubit = qubits[1] ?? qubits[0]
    const fixed = generateFixedLayer(numQubits, [p0Qubit, p1Qubit])
    rounds.push({ p0Qubit, p1Qubit, fixed })
  }
  const { hand0, hand1 } = distributeHands(numRounds)
  return { numQubits, numRounds, rounds, hand0, hand1 }
}

// Simulate the circuit. `resolvedRounds` rounds are applied in full (player gates
// then fixed gates). If `provisionalPlacement` is given, its player gates are
// applied on top (without the fixed layer) so the board can preview a move.
export function simulate(
  game: Game,
  placements: Placement[],
  resolvedRounds: number,
  provisionalPlacement?: Placement,
): StateVector {
  const state = initState(game.numQubits)
  // Init layer: Hadamard on every qubit.
  for (let q = 0; q < game.numQubits; q++) applySingleGate(state, "H", q)

  for (let r = 0; r < resolvedRounds; r++) {
    const round = game.rounds[r]
    const placement = placements[r]
    if (placement?.p0) applySingleGate(state, placement.p0, round.p0Qubit)
    if (placement?.p1) applySingleGate(state, placement.p1, round.p1Qubit)
    for (const g of round.fixed) {
      if (g.type === "CX" && g.control !== undefined) {
        applyCX(state, g.control, g.target)
      } else if (g.type !== "CX") {
        applySingleGate(state, g.type, g.target)
      }
    }
  }

  if (provisionalPlacement && resolvedRounds < game.numRounds) {
    const round = game.rounds[resolvedRounds]
    if (provisionalPlacement.p0) applySingleGate(state, provisionalPlacement.p0, round.p0Qubit)
    if (provisionalPlacement.p1) applySingleGate(state, provisionalPlacement.p1, round.p1Qubit)
  }

  return state
}

export function emptyPlacements(numRounds: number): Placement[] {
  return Array.from({ length: numRounds }, () => ({ p0: null, p1: null }))
}
