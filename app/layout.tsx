import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Quantum Hold'em",
  description:
    "A two-player quantum poker duel. Place gate cards into a pre-populated quantum circuit — Zeros battles Ones for control of the final measurement.",
}

export const viewport: Viewport = {
  themeColor: "#0b0e1a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
