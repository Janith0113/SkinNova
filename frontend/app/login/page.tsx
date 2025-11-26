"use client"
import AuthForm from '../../components/AuthForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
        <p className="text-center text-sm mt-4">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">Forgot Password?</Link>
        </p>
      </div>
    </div>
  )
}
