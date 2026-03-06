import React, { useState } from 'react'
import { DollarSignIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'signing-in' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setStatus('signing-in')
    setErrorMsg('')

    const { error } = await signInWithPassword(email.trim(), password)
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('success')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--eqx-base)' }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center"><DollarSignIcon size={48} strokeWidth={1.5} style={{ color: 'var(--eqx-mint)' }} /></div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--eqx-primary)', fontFamily: 'DM Sans, sans-serif' }}
          >
            Crunch Time
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--eqx-secondary)' }}
          >
            Sign in to your group fund
          </p>
        </div>

        {status === 'success' ? (
          <div className="flex justify-center py-8">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'var(--eqx-hairline)',
                borderTopColor: 'var(--eqx-mint)',
              }}
            />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl px-4 py-3 text-base outline-none placeholder:opacity-40"
            style={{
              backgroundColor: 'var(--eqx-surface)',
              color: 'var(--eqx-primary)',
              border: '1px solid var(--eqx-hairline)',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl px-4 py-3 text-base outline-none placeholder:opacity-40"
            style={{
              backgroundColor: 'var(--eqx-surface)',
              color: 'var(--eqx-primary)',
              border: '1px solid var(--eqx-hairline)',
            }}
          />

          {status === 'error' && (
            <p className="text-sm" style={{ color: 'var(--eqx-coral)' }}>
              {errorMsg || 'Invalid email or password.'}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'signing-in' || !email.trim() || !password}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--eqx-mint)',
              color: 'var(--eqx-base)',
            }}
          >
            {status === 'signing-in' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
