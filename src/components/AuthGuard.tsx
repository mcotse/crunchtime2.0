import React from 'react'
import { ShieldIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { LoginPage } from '../pages/LoginPage'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, member, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--eqx-base)' }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: 'var(--eqx-hairline)',
            borderTopColor: 'var(--eqx-mint)',
          }}
        />
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  if (!member) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'var(--eqx-base)' }}
      >
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex justify-center"><ShieldIcon size={40} strokeWidth={1.5} style={{ color: 'var(--eqx-coral)' }} /></div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--eqx-primary)' }}
          >
            Not a member
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--eqx-secondary)' }}
          >
            Your account isn't linked to a member of this group. Contact an admin to be added.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
