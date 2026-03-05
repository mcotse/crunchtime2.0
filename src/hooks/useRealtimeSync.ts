import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const TABLE_QUERY_MAP: Record<string, string[]> = {
  transactions: ['transactions'],
  transaction_splits: ['transactions'],
  transaction_attendees: ['transactions'],
  transaction_edit_history: ['transactions'],
  events: ['events'],
  event_rsvps: ['events'],
  polls: ['polls'],
  poll_options: ['polls'],
  poll_votes: ['polls'],
  poll_comments: ['polls'],
  challenges: ['challenges'],
  challenge_participants: ['challenges'],
  calendar_availability: ['calendar'],
}

export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase.channel('realtime-sync')

    for (const table of Object.keys(TABLE_QUERY_MAP)) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          const queryKeys = TABLE_QUERY_MAP[table]
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: [key] })
          }
        }
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
