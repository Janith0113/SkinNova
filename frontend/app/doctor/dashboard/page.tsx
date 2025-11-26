"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (raw) {
      setUser(JSON.parse(raw))
    } else {
      // not logged in -> redirect to login
      router.push('/login')
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="max-w-4xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-4">Doctor Dashboard</h1>
      {user && (
        <div>
          <p className="mb-2">Welcome, <strong>{user.name}</strong></p>
          <p className="mb-4">Role: <strong>{user.role}</strong></p>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
      )}
    </div>
  )
}
