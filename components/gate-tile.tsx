import type { GateType } from "@/lib/game"

export const GATE_INFO: Record<GateType, { label: string; name: string; desc: string }> = {
  I: { label: "I", name: "Identity", desc: "Does nothing — the qubit is left untouched." },
  X: { label: "X", name: "Pauli-X", desc: "The quantum NOT: swaps |0⟩ and |1⟩." },
  Z: { label: "Z", name: "Pauli-Z", desc: "Phase flip: adds a minus sign to |1⟩." },
  H: { label: "H", name: "Hadamard", desc: "Puts a qubit into an equal superposition." },
  HZ: { label: "HZ", name: "Z then H", desc: "Superposition with a flipped relative phase." },
  CX: { label: "CX", name: "Controlled-X", desc: "Flips the target only when the control is |1⟩." },
}

export type GateVariant = "p0" | "p1" | "fixed" | "init"

const VARIANT_CLASSES: Record<GateVariant, string> = {
  p0: "border-p0 text-p0 bg-[color-mix(in_oklch,var(--color-p0)_16%,transparent)] shadow-[0_0_14px_-4px_var(--color-p0)]",
  p1: "border-p1 text-p1 bg-[color-mix(in_oklch,var(--color-p1)_16%,transparent)] shadow-[0_0_14px_-4px_var(--color-p1)]",
  fixed:
    "border-accent text-accent bg-[color-mix(in_oklch,var(--color-accent)_14%,transparent)] shadow-[0_0_14px_-6px_var(--color-accent)]",
  init: "border-border text-muted bg-surface-2",
}

export function GateGlyph({
  gate,
  variant,
  sizeClass = "h-11 w-11 text-base",
  pop = false,
}: {
  gate: GateType
  variant: GateVariant
  sizeClass?: string
  pop?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border font-mono font-bold tracking-tight ${sizeClass} ${VARIANT_CLASSES[variant]} ${pop ? "animate-gate-pop" : ""}`}
    >
      {GATE_INFO[gate].label}
    </div>
  )
}
