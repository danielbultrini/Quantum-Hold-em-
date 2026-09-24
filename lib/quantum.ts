// A tiny statevector simulator for the gate set used in Quantum Hold'em.
// Qubit convention: qubit q corresponds to bit q of the basis-state index
// (little-endian, matching Qiskit's ordering used in the original Python game).

export type Complex = { re: number; im: number }

export type SingleGate = "H" | "HZ" | "X" | "Z" | "I"
export type GateType = SingleGate | "CX"

const SQRT1_2 = Math.SQRT1_2

// 2x2 unitary matrices (all real for this gate set). Row-major [ [a,b],[c,d] ].
const MATRICES: Record<SingleGate, [number, number, number, number]> = {
  I: [1, 0, 0, 1],
  X: [0, 1, 1, 0],
  Z: [1, 0, 0, -1],
  H: [SQRT1_2, SQRT1_2, SQRT1_2, -SQRT1_2],
  // Original game applies Z then H, i.e. the operator H·Z.
  HZ: [SQRT1_2, -SQRT1_2, SQRT1_2, SQRT1_2],
}

export type StateVector = Complex[]

export function initState(numQubits: number): StateVector {
  const size = 1 << numQubits
  const state: StateVector = new Array(size)
  for (let i = 0; i < size; i++) state[i] = { re: 0, im: 0 }
  state[0] = { re: 1, im: 0 }
  return state
}

export function applySingleGate(state: StateVector, gate: SingleGate, target: number): void {
  if (gate === "I") return
  const [a, b, c, d] = MATRICES[gate]
  const bit = 1 << target
  const size = state.length
  for (let i = 0; i < size; i++) {
    if ((i & bit) !== 0) continue
    const j = i | bit
    const s0 = state[i]
    const s1 = state[j]
    state[i] = {
      re: a * s0.re + b * s1.re,
      im: a * s0.im + b * s1.im,
    }
    state[j] = {
      re: c * s0.re + d * s1.re,
      im: c * s0.im + d * s1.im,
    }
  }
}

export function applyCX(state: StateVector, control: number, target: number): void {
  if (control === target) return
  const cBit = 1 << control
  const tBit = 1 << target
  const size = state.length
  for (let i = 0; i < size; i++) {
    // Swap amplitudes where control=1 and target=0 with target=1.
    if ((i & cBit) !== 0 && (i & tBit) === 0) {
      const j = i | tBit
      const tmp = state[i]
      state[i] = state[j]
      state[j] = tmp
    }
  }
}

export function probabilities(state: StateVector): number[] {
  return state.map((c) => c.re * c.re + c.im * c.im)
}

function popcount(n: number): number {
  let count = 0
  while (n > 0) {
    count += n & 1
    n >>= 1
  }
  return count
}

// Expected fraction of qubits measured as |1>, expressed as a percentage 0-100.
// Player 1 (ones) wants this high, Player 0 (zeros) wants it low.
export function onesScore(state: StateVector, numQubits: number): number {
  const probs = probabilities(state)
  let expectedOnes = 0
  for (let i = 0; i < probs.length; i++) {
    expectedOnes += probs[i] * popcount(i)
  }
  return (expectedOnes / numQubits) * 100
}

// Human-readable bitstring for a basis-state index.
// q0 is the left-most character to match the original game's display.
export function indexToBitstring(index: number, numQubits: number): string {
  let s = ""
  for (let q = 0; q < numQubits; q++) {
    s += (index >> q) & 1
  }
  return s
}
