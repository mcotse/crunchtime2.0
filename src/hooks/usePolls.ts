import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Poll, PollOption, PollComment } from '../data/pollsData'

export function usePolls() {
  return useQuery<Poll[]>({
    queryKey: ['polls'],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id, title, creator_id, expires_at, is_archived, archived_at,
          allow_members_to_add_options, allow_multi_select, created_at,
          poll_options (
            id, text, created_at,
            poll_votes (member_id)
          ),
          poll_comments (
            id, member_id, text, created_at, edited_at, deleted_at
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row): Poll => ({
        id: row.id,
        title: row.title,
        creatorId: row.creator_id,
        createdAt: row.created_at,
        expiresAt: row.expires_at ?? undefined,
        isArchived: row.is_archived ?? false,
        archivedAt: row.archived_at ?? undefined,
        allowMembersToAddOptions: row.allow_members_to_add_options ?? false,
        allowMultiSelect: row.allow_multi_select ?? false,
        options: (row.poll_options ?? []).map(
          (o: { id: string; text: string; created_at: string; poll_votes: { member_id: string }[] }): PollOption => ({
            id: o.id,
            text: o.text,
            voterIds: (o.poll_votes ?? []).map((v) => v.member_id),
          })
        ),
        comments: (row.poll_comments ?? [])
          .filter((c: { deleted_at: string | null }) => !c.deleted_at)
          .map(
            (c: { id: string; member_id: string; text: string; created_at: string; edited_at: string | null }): PollComment => ({
              id: c.id,
              memberId: c.member_id,
              text: c.text,
              createdAt: c.created_at,
              editedAt: c.edited_at ?? undefined,
            })
          ),
      }))
    },
  })
}

interface CreatePollInput {
  title: string
  creatorId: string
  expiresAt?: string
  allowMembersToAddOptions?: boolean
  allowMultiSelect?: boolean
  options: string[]
}

export function useCreatePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePollInput) => {
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: input.title,
          creator_id: input.creatorId,
          expires_at: input.expiresAt ?? null,
          allow_members_to_add_options: input.allowMembersToAddOptions ?? false,
          allow_multi_select: input.allowMultiSelect ?? false,
        })
        .select('id')
        .single()

      if (pollError) throw pollError

      if (input.options.length > 0) {
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(input.options.map((text) => ({ poll_id: poll.id, text })))

        if (optionsError) throw optionsError
      }

      return poll.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useDeletePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', pollId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ optionId, memberId }: { optionId: string; memberId: string }) => {
      // Check if vote exists
      const { data: existing } = await supabase
        .from('poll_votes')
        .select('poll_option_id')
        .eq('poll_option_id', optionId)
        .eq('member_id', memberId)
        .maybeSingle()

      if (existing) {
        // Remove vote (toggle off)
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_option_id', optionId)
          .eq('member_id', memberId)

        if (error) throw error
      } else {
        // Add vote (toggle on)
        const { error } = await supabase
          .from('poll_votes')
          .insert({ poll_option_id: optionId, member_id: memberId })

        if (error) throw error
      }
    },
    onMutate: async ({ optionId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ['polls'] })
      const previous = queryClient.getQueryData<Poll[]>(['polls'])
      queryClient.setQueryData<Poll[]>(['polls'], (old) =>
        (old ?? []).map((poll) => ({
          ...poll,
          options: poll.options.map((opt) => {
            if (opt.id !== optionId) return opt
            const hasVote = opt.voterIds.includes(memberId)
            return {
              ...opt,
              voterIds: hasVote
                ? opt.voterIds.filter((id) => id !== memberId)
                : [...opt.voterIds, memberId],
            }
          }),
        }))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['polls'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useAddPollOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pollId, text }: { pollId: string; text: string }) => {
      const { error } = await supabase
        .from('poll_options')
        .insert({ poll_id: pollId, text })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useArchivePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', pollId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useUnarchivePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .update({ is_archived: false, archived_at: null })
        .eq('id', pollId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pollId, memberId, text }: { pollId: string; memberId: string; text: string }) => {
      const { error } = await supabase
        .from('poll_comments')
        .insert({ poll_id: pollId, member_id: memberId, text })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('poll_comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}
