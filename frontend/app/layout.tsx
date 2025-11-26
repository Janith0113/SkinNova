"use client"
import '../styles/globals.css'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'SkinNova',
  description: 'Starter Next.js + TypeScript + Tailwind project',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Hide the navbar on the login and signup pages
  const hideNavbar = pathname === '/login' || pathname === '/signup'

  return (
    <html lang="en">
      <body>
        {!hideNavbar && <Navbar />}
        <main className={hideNavbar ? '' : 'pt-16'}>{children}</main>
      </body>
    </html>
  )
}
