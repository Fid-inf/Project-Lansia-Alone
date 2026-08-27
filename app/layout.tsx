import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Latihan Otak & Motorik Lansia | Brain & Motor Training",
  description:
    "An accessible (GEDSI) brain and motoric training platform designed for elderly users, featuring memory and reaction-speed exercises with research metrics.",
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`bg-background ${inter.className}`}>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
