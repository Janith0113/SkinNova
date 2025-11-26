"use client"
import '../styles/globals.css'
import { ReactNode } from 'react'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'SkinNova',
  description: 'Starter Next.js + TypeScript + Tailwind project',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
