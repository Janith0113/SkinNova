"use client"
import AuthForm from '../../components/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <AuthForm mode="signup" />
    </div>
  )
}
