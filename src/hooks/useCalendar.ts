import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CalendarAvailability } from '../data/calendarData'

export function useCalendarAvailability() {
  return useQuery<CalendarAvailability>({
    queryKey: ['calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_availability')
        .select('date_str, member_id')

      if (error) throw error

      const result: CalendarAvailability = {}
      for (const row of data ?? []) {
        if (!result[row.date_str]) {
          result[row.date_str] = { memberIds: [] }
        }
        result[row.date_str].memberIds.push(row.member_id)
      }

      return result
    },
  })
}

export function useToggleAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dateStr, memberId }: { dateStr: string; memberId: string }) => {
      // Check if row exists
      const { data: existing } = await supabase
        .from('calendar_availability')
        .select('date_str')
        .eq('date_str', dateStr)
        .eq('member_id', memberId)
        .maybeSingle()

      if (existing) {
        // Remove availability
        const { error } = await supabase
          .from('calendar_availability')
          .delete()
          .eq('date_str', dateStr)
          .eq('member_id', memberId)

        if (error) throw error
      } else {
        // Add availability
        const { error } = await supabase
          .from('calendar_availability')
          .insert({ date_str: dateStr, member_id: memberId })

        if (error) throw error
      }
    },
    onMutate: async ({ dateStr, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ['calendar'] })
      const previous = queryClient.getQueryData<CalendarAvailability>(['calendar'])
      queryClient.setQueryData<CalendarAvailability>(['calendar'], (old) => {
        const next = { ...(old ?? {}) }
        const day = next[dateStr] ? { ...next[dateStr], memberIds: [...next[dateStr].memberIds] } : { memberIds: [] }
        const idx = day.memberIds.indexOf(memberId)
        if (idx >= 0) {
          day.memberIds.splice(idx, 1)
        } else {
          day.memberIds.push(memberId)
        }
        next[dateStr] = day
        return next
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['calendar'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
