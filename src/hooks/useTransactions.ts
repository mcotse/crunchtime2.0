import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Transaction, TransactionSplit } from '../data/mockData'

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, type, description, amount, member_id, date,
          funding_source, challenge_id, fine_status, category,
          split_locked,
          transaction_splits (id, member_id, share, is_payer, guest_shares),
          transaction_attendees (member_id),
          transaction_edit_history (edited_by, edited_at, change)
        `)
        .is('deleted_at', null)
        .order('date', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row): Transaction => ({
        id: row.id,
        type: row.type as Transaction['type'],
        description: row.description,
        amount: Number(row.amount),
        memberId: row.member_id,
        date: row.date,
        fundingSource: row.funding_source as Transaction['fundingSource'],
        challengeId: row.challenge_id ?? undefined,
        fineStatus: row.fine_status as Transaction['fineStatus'],
        category: row.category ?? undefined,
        splitLocked: row.split_locked ?? false,
        attendees: (row.transaction_attendees ?? []).map(
          (a: { member_id: string }) => a.member_id
        ),
        splits: (row.transaction_splits ?? []).map(
          (s: { id: string; member_id: string; share: number; is_payer: boolean; guest_shares: number }) => ({
            memberId: s.member_id,
            share: Number(s.share),
            isPayer: s.is_payer || undefined,
            guestShares: s.guest_shares || undefined,
          })
        ),
        editHistory: (row.transaction_edit_history ?? []).map(
          (h: { edited_by: string; edited_at: string; change: string }) => ({
            editedBy: h.edited_by,
            editedAt: h.edited_at,
            change: h.change,
          })
        ),
      }))
    },
  })
}

interface AddTransactionInput {
  transaction: Omit<Transaction, 'id' | 'editHistory'>
}

export function useAddTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ transaction }: AddTransactionInput) => {
      // Insert the transaction
      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          member_id: transaction.memberId,
          date: transaction.date,
          funding_source: transaction.fundingSource ?? null,
          challenge_id: transaction.challengeId ?? null,
          fine_status: transaction.fineStatus ?? null,
          category: transaction.category ?? null,
          split_locked: transaction.splitLocked ?? false,
        })
        .select('id')
        .single()

      if (txError) throw txError

      const txId = txRow.id

      // Insert splits if provided
      if (transaction.splits && transaction.splits.length > 0) {
        const { error: splitsError } = await supabase
          .from('transaction_splits')
          .insert(
            transaction.splits.map((s) => ({
              transaction_id: txId,
              member_id: s.memberId,
              share: s.share,
              is_payer: s.isPayer ?? false,
              guest_shares: s.guestShares ?? 0,
            }))
          )
        if (splitsError) throw splitsError
      }

      // Insert attendees if provided
      if (transaction.attendees && transaction.attendees.length > 0) {
        const { error: attendeesError } = await supabase
          .from('transaction_attendees')
          .insert(
            transaction.attendees.map((memberId) => ({
              transaction_id: txId,
              member_id: memberId,
            }))
          )
        if (attendeesError) throw attendeesError
      }

      return txId
    },
    onMutate: async ({ transaction }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const previous = queryClient.getQueryData<Transaction[]>(['transactions'])
      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        ...transaction,
        editHistory: [],
      }
      queryClient.setQueryData<Transaction[]>(['transactions'], (old) =>
        [optimistic, ...(old ?? [])]
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['transactions'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateFinePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('transactions')
        .update({ fine_status: 'paid' })
        .eq('id', transactionId)

      if (error) throw error
    },
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const previous = queryClient.getQueryData<Transaction[]>(['transactions'])
      queryClient.setQueryData<Transaction[]>(['transactions'], (old) =>
        (old ?? []).map((tx) =>
          tx.id === transactionId ? { ...tx, fineStatus: 'paid' as Transaction['fineStatus'] } : tx
        )
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['transactions'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionId,
      splits,
    }: {
      transactionId: string
      splits: TransactionSplit[]
    }) => {
      // Delete existing splits for this transaction
      const { error: deleteError } = await supabase
        .from('transaction_splits')
        .delete()
        .eq('transaction_id', transactionId)

      if (deleteError) throw deleteError

      // Insert new splits
      const { error: insertError } = await supabase
        .from('transaction_splits')
        .insert(
          splits.map((s) => ({
            transaction_id: transactionId,
            member_id: s.memberId,
            share: s.share,
            is_payer: s.isPayer ?? false,
            guest_shares: s.guestShares ?? 0,
          }))
        )

      if (insertError) throw insertError

      // Mark split as locked
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ split_locked: true })
        .eq('id', transactionId)

      if (updateError) throw updateError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
