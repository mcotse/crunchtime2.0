import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    setErrorMsg('')

    const { error } = await signIn(email.trim())
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--eqx-base)' }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="text-5xl">💰</div>
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

        {status === 'sent' ? (
          <div
            className="rounded-xl p-6 text-center space-y-3"
            style={{ backgroundColor: 'var(--eqx-surface)' }}
          >
            <div className="text-3xl">📬</div>
            <p
              className="font-medium"
              style={{ color: 'var(--eqx-primary)' }}
            >
              Check your email
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--eqx-secondary)' }}
            >
              We sent a magic link to <strong style={{ color: 'var(--eqx-primary)' }}>{email}</strong>
            </p>
            <button
              onClick={() => { setStatus('idle'); setEmail('') }}
              className="text-sm mt-2"
              style={{ color: 'var(--eqx-mint)' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-40"
                style={{
                  backgroundColor: 'var(--eqx-surface)',
                  color: 'var(--eqx-primary)',
                  border: '1px solid var(--eqx-hairline)',
                }}
              />
            </div>

            {status === 'error' && (
              <p className="text-sm" style={{ color: 'var(--eqx-coral)' }}>
                {errorMsg || 'Something went wrong. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: 'var(--eqx-mint)',
                color: 'var(--eqx-base)',
              }}
            >
              {status === 'sending' ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
