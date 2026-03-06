-- ============================================================================
-- Migration 006: RLS Security Fixes
-- Hardens INSERT and UPDATE policies to prevent privilege escalation
-- and impersonation attacks.
-- ============================================================================

-- ============================================================================
-- Fix 1: Prevent admin self-promotion
--
-- The original update_own_member policy only checked auth_user_id = auth.uid()
-- in the USING clause, which allowed any user to set is_admin = true,
-- modify their balance, or soft-delete themselves. The WITH CHECK clause now
-- ensures those sensitive columns remain unchanged.
-- ============================================================================
drop policy if exists "update_own_member" on members;
create policy "update_own_member" on members
  for update using (auth_user_id = auth.uid())
  with check (
    -- is_admin must stay the same as the current value
    is_admin = (select m.is_admin from public.members m where m.auth_user_id = auth.uid())
    -- balance must stay the same as the current value
    and balance = (select m.balance from public.members m where m.auth_user_id = auth.uid())
    -- deleted_at must stay the same (handles NULL correctly)
    and deleted_at is not distinct from (select m.deleted_at from public.members m where m.auth_user_id = auth.uid())
  );

-- ============================================================================
-- Fix 3: Tighten INSERT policies to prevent impersonation
--
-- Several INSERT policies only checked auth.uid() IS NOT NULL, allowing any
-- authenticated user to insert rows attributed to other members.
-- ============================================================================

-- --------------------------------------------------------------------------
-- event_rsvps: Ensure users can only RSVP as themselves
-- --------------------------------------------------------------------------
drop policy if exists "insert_event_rsvps" on event_rsvps;
create policy "insert_event_rsvps" on event_rsvps
  for insert with check (
    auth.uid() is not null
    and member_id = get_member_id()
  );

-- --------------------------------------------------------------------------
-- transaction_edit_history: Ensure edit records are attributed to the editor
-- --------------------------------------------------------------------------
drop policy if exists "insert_transaction_edit_history" on transaction_edit_history;
create policy "insert_transaction_edit_history" on transaction_edit_history
  for insert with check (
    auth.uid() is not null
    and edited_by = get_member_id()
  );

-- --------------------------------------------------------------------------
-- poll_options: Only the poll creator can add options, unless the poll
-- explicitly allows members to add options.
-- --------------------------------------------------------------------------
drop policy if exists "insert_poll_options" on poll_options;
create policy "insert_poll_options" on poll_options
  for insert with check (
    auth.uid() is not null
    and (
      -- Poll creator can always add options
      exists (
        select 1 from polls p
        where p.id = poll_id and p.creator_id = get_member_id()
      )
      -- Other members can add options only if the poll allows it
      or exists (
        select 1 from polls p
        where p.id = poll_id and p.allow_members_to_add_options = true
      )
    )
  );

-- --------------------------------------------------------------------------
-- transaction_splits: The transaction creator inserts splits for other
-- members, so verify the inserter owns the parent transaction (or is admin).
-- --------------------------------------------------------------------------
drop policy if exists "insert_transaction_splits" on transaction_splits;
create policy "insert_transaction_splits" on transaction_splits
  for insert with check (
    auth.uid() is not null
    and (
      exists (
        select 1 from transactions t
        where t.id = transaction_id and t.member_id = get_member_id()
      )
      or is_admin()
    )
  );

-- --------------------------------------------------------------------------
-- transaction_attendees: Same pattern as transaction_splits — only the
-- transaction creator or an admin can insert attendees.
-- --------------------------------------------------------------------------
drop policy if exists "insert_transaction_attendees" on transaction_attendees;
create policy "insert_transaction_attendees" on transaction_attendees
  for insert with check (
    auth.uid() is not null
    and (
      exists (
        select 1 from transactions t
        where t.id = transaction_id and t.member_id = get_member_id()
      )
      or is_admin()
    )
  );
