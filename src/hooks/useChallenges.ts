import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Challenge } from '../data/mockData'

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id, name, emoji, description, start_date, end_date,
          fine_amount, status, linked_poll_id,
          challenge_participants (member_id)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row): Challenge => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji ?? '',
        description: row.description ?? '',
        participantIds: (row.challenge_participants ?? []).map(
          (p: { member_id: string }) => p.member_id
        ),
        startDate: row.start_date,
        endDate: row.end_date,
        fineAmount: Number(row.fine_amount),
        status: row.status as Challenge['status'],
        linkedPollId: row.linked_poll_id ?? undefined,
        createdFromPollId: row.linked_poll_id ?? undefined,
      }))
    },
  })
}

export function useJoinChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ challengeId, memberId }: { challengeId: string; memberId: string }) => {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          member_id: memberId,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}
