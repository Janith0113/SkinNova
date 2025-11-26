"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = mode === 'signup' ? { name, email, password, role } : { email, password }

      console.log(`Calling ${endpoint} with body:`, body)

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log(`Response status: ${res.status}`, data)

      if (!res.ok) {
        throw new Error(data.error || 'Auth failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      console.log('User stored:', data.user)

      // Redirect to role-specific dashboard
      const userRole = data.user?.role
      console.log('User role:', userRole)
      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else if (userRole === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{mode === 'login' ? 'Login' : 'Create an account'}</h2>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {mode === 'signup' && (
        <>
          <label className="block mb-2 text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />

          <label className="block mb-2 text-sm font-medium">Role</label>
          <select value={role} onChange={e => setRole(e.target.value as 'patient' | 'doctor')} className="w-full mb-4 p-2 border rounded">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </>
      )}

      <label className="block mb-2 text-sm font-medium">Email</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

      <label className="block mb-2 text-sm font-medium">Password</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Loading...' : (mode === 'login' ? 'Login' : 'Sign Up')}
      </button>
    </form>
  )
}
