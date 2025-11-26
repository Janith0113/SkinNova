"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (raw) setUser(JSON.parse(raw))
  }, [])

  function goToDashboard(e: any) {
    e.preventDefault()
    const role = user?.role
    if (role === 'admin') router.push('/admin/dashboard')
    else if (role === 'doctor') router.push('/doctor/dashboard')
    else router.push('/patient/dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">SkinNova</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <a href="#" onClick={goToDashboard} className="text-sm text-gray-700 hover:text-gray-900">Dashboard</a>
              <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-gray-900">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Login</Link>
              <Link href="/signup" className="text-sm text-gray-700 hover:text-gray-900">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
