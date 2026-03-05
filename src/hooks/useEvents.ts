import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { GroupEvent, EventRSVP } from '../data/eventsData'

export function useEvents() {
  return useQuery<GroupEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, description, date_str, time, location,
          location_maps_query, creator_id, cover_emoji, is_archived,
          linked_transaction_id, created_at,
          event_rsvps (member_id, status, guest_count)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row): GroupEvent => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        dateStr: row.date_str ?? undefined,
        time: row.time ?? undefined,
        location: row.location ?? undefined,
        locationMapsQuery: row.location_maps_query ?? undefined,
        creatorId: row.creator_id,
        createdAt: row.created_at,
        linkedTransactionId: row.linked_transaction_id ?? undefined,
        coverEmoji: row.cover_emoji ?? '',
        isArchived: row.is_archived ?? false,
        rsvps: (row.event_rsvps ?? []).map(
          (r: { member_id: string; status: string; guest_count: number }): EventRSVP => ({
            memberId: r.member_id,
            status: r.status as EventRSVP['status'],
            guestCount: r.guest_count || undefined,
          })
        ),
      }))
    },
  })
}

interface CreateEventInput {
  title: string
  description?: string
  dateStr?: string
  time?: string
  location?: string
  locationMapsQuery?: string
  creatorId: string
  coverEmoji?: string
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: input.title,
          description: input.description ?? null,
          date_str: input.dateStr ?? null,
          time: input.time ?? null,
          location: input.location ?? null,
          location_maps_query: input.locationMapsQuery ?? null,
          creator_id: input.creatorId,
          cover_emoji: input.coverEmoji ?? '',
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

interface UpdateEventInput {
  id: string
  title?: string
  description?: string
  dateStr?: string
  time?: string
  location?: string
  locationMapsQuery?: string
  coverEmoji?: string
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const updates: Record<string, unknown> = {}
      if (input.title !== undefined) updates.title = input.title
      if (input.description !== undefined) updates.description = input.description
      if (input.dateStr !== undefined) updates.date_str = input.dateStr
      if (input.time !== undefined) updates.time = input.time
      if (input.location !== undefined) updates.location = input.location
      if (input.locationMapsQuery !== undefined) updates.location_maps_query = input.locationMapsQuery
      if (input.coverEmoji !== undefined) updates.cover_emoji = input.coverEmoji

      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', input.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', eventId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useArchiveEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: true })
        .eq('id', eventId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUnarchiveEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: false })
        .eq('id', eventId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useRsvp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      memberId,
      status,
      guestCount,
    }: {
      eventId: string
      memberId: string
      status: EventRSVP['status']
      guestCount?: number
    }) => {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert(
          {
            event_id: eventId,
            member_id: memberId,
            status,
            guest_count: guestCount ?? 0,
          },
          { onConflict: 'event_id,member_id' }
        )

      if (error) throw error
    },
    onMutate: async ({ eventId, memberId, status, guestCount }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] })
      const previous = queryClient.getQueryData<GroupEvent[]>(['events'])
      queryClient.setQueryData<GroupEvent[]>(['events'], (old) =>
        (old ?? []).map((event) => {
          if (event.id !== eventId) return event
          const existingIdx = event.rsvps.findIndex((r) => r.memberId === memberId)
          const newRsvp: EventRSVP = { memberId, status, guestCount }
          const rsvps = [...event.rsvps]
          if (existingIdx >= 0) {
            rsvps[existingIdx] = newRsvp
          } else {
            rsvps.push(newRsvp)
          }
          return { ...event, rsvps }
        })
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['events'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
