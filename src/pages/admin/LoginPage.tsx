import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signInWithGoogle, signInWithEmail } = useAuthStore()
  const navigate = useNavigate()

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      navigate('/admin')
    } catch {
      setError('Google sign-in failed. Try again.')
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmail(email, password)
      navigate('/admin')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Owner sign in</h1>

        <Button className="mb-4 w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">or</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
