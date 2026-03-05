import { useState, useEffect, useCallback } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthMember {
  id: string
  name: string
  initials: string
  email: string
  color: string
  is_admin: boolean
}

interface UseAuthReturn {
  session: Session | null
  member: AuthMember | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [member, setMember] = useState<AuthMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch member from members table by auth_user_id
  const fetchMember = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, initials, email, color, is_admin')
      .eq('auth_user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      setMember(null)
    } else {
      setMember(data as AuthMember)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user?.id) {
        fetchMember(s.user.id).then(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        if (s?.user?.id) {
          fetchMember(s.user.id).then(() => setIsLoading(false))
        } else {
          setMember(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchMember])

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setMember(null)
  }, [])

  return {
    session,
    member,
    isLoading,
    isAdmin: member?.is_admin ?? false,
    signIn,
    signOut,
  }
}
