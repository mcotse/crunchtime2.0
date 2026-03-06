import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Member } from '../data/mockData'

export function useMembers() {
  return useQuery<Member[]>({
    queryKey: ['members'],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, initials, phone, email, color, balance')
        .is('deleted_at', null)

      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        initials: row.initials,
        phone: row.phone ?? '',
        email: row.email,
        color: row.color,
        balance: Number(row.balance) || 0,
      }))
    },
  })
}
