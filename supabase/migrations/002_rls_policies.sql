-- ============================================================================
-- Crunch Time: RLS Policies and Helper Functions
-- Per BACKEND_SPEC.md permissions matrix
-- ============================================================================

-- Helper functions
create or replace function get_member_id()
returns uuid as $$
  select id from members where auth_user_id = auth.uid()
$$ language sql security definer stable;

create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from members where auth_user_id = auth.uid()),
    false
  )
$$ language sql security definer stable;

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
alter table members enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table transactions enable row level security;
alter table transaction_splits enable row level security;
alter table transaction_attendees enable row level security;
alter table transaction_edit_history enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table poll_comments enable row level security;
alter table calendar_availability enable row level security;

-- ============================================================================
-- members
-- ============================================================================
create policy "read_members" on members
  for select using (auth.uid() is not null and deleted_at is null);

create policy "update_own_member" on members
  for update using (auth_user_id = auth.uid());

-- ============================================================================
-- challenges
-- ============================================================================
create policy "read_challenges" on challenges
  for select using (auth.uid() is not null and deleted_at is null);

create policy "insert_challenges" on challenges
  for insert with check (is_admin());

create policy "update_challenges" on challenges
  for update using (is_admin());

-- ============================================================================
-- challenge_participants
-- ============================================================================
create policy "read_challenge_participants" on challenge_participants
  for select using (auth.uid() is not null);

create policy "insert_challenge_participants" on challenge_participants
  for insert with check (auth.uid() is not null and member_id = get_member_id());

create policy "delete_challenge_participants" on challenge_participants
  for delete using (member_id = get_member_id() or is_admin());

-- ============================================================================
-- transactions
-- ============================================================================
create policy "read_transactions" on transactions
  for select using (auth.uid() is not null and deleted_at is null);

create policy "insert_expense" on transactions
  for insert with check (
    auth.uid() is not null
    and type = 'expense'
    and member_id = get_member_id()
  );

create policy "insert_fine" on transactions
  for insert with check (
    is_admin() and type = 'fine'
  );

create policy "update_transaction" on transactions
  for update using (
    member_id = get_member_id() or is_admin()
  );

-- ============================================================================
-- transaction_splits
-- ============================================================================
create policy "read_transaction_splits" on transaction_splits
  for select using (auth.uid() is not null);

create policy "insert_transaction_splits" on transaction_splits
  for insert with check (auth.uid() is not null);

create policy "update_transaction_splits" on transaction_splits
  for update using (
    -- payer, or admin
    member_id = get_member_id() or is_admin()
    or exists (
      select 1 from transactions t
      where t.id = transaction_id and t.member_id = get_member_id()
    )
  );

create policy "delete_transaction_splits" on transaction_splits
  for delete using (
    exists (
      select 1 from transactions t
      where t.id = transaction_id and t.member_id = get_member_id()
    )
    or is_admin()
  );

-- ============================================================================
-- transaction_attendees
-- ============================================================================
create policy "read_transaction_attendees" on transaction_attendees
  for select using (auth.uid() is not null);

create policy "insert_transaction_attendees" on transaction_attendees
  for insert with check (auth.uid() is not null);

create policy "delete_transaction_attendees" on transaction_attendees
  for delete using (
    exists (
      select 1 from transactions t
      where t.id = transaction_id and t.member_id = get_member_id()
    )
    or is_admin()
  );

-- ============================================================================
-- transaction_edit_history
-- ============================================================================
create policy "read_transaction_edit_history" on transaction_edit_history
  for select using (auth.uid() is not null);

create policy "insert_transaction_edit_history" on transaction_edit_history
  for insert with check (auth.uid() is not null);

-- ============================================================================
-- events
-- ============================================================================
create policy "read_events" on events
  for select using (auth.uid() is not null and deleted_at is null);

create policy "insert_events" on events
  for insert with check (
    auth.uid() is not null and creator_id = get_member_id()
  );

create policy "update_events" on events
  for update using (
    creator_id = get_member_id() or is_admin()
  );

-- ============================================================================
-- event_rsvps
-- ============================================================================
create policy "read_event_rsvps" on event_rsvps
  for select using (auth.uid() is not null);

create policy "insert_event_rsvps" on event_rsvps
  for insert with check (auth.uid() is not null);

create policy "update_event_rsvps" on event_rsvps
  for update using (
    member_id = get_member_id() or is_admin()
  );

create policy "delete_event_rsvps" on event_rsvps
  for delete using (
    member_id = get_member_id() or is_admin()
  );

-- ============================================================================
-- polls
-- ============================================================================
create policy "read_polls" on polls
  for select using (auth.uid() is not null and deleted_at is null);

create policy "insert_polls" on polls
  for insert with check (
    auth.uid() is not null and creator_id = get_member_id()
  );

create policy "update_polls" on polls
  for update using (
    creator_id = get_member_id() or is_admin()
  );

-- ============================================================================
-- poll_options
-- ============================================================================
create policy "read_poll_options" on poll_options
  for select using (auth.uid() is not null);

create policy "insert_poll_options" on poll_options
  for insert with check (auth.uid() is not null);

create policy "delete_poll_options" on poll_options
  for delete using (
    exists (
      select 1 from polls p
      where p.id = poll_id and (p.creator_id = get_member_id() or is_admin())
    )
  );

-- ============================================================================
-- poll_votes
-- ============================================================================
create policy "read_poll_votes" on poll_votes
  for select using (auth.uid() is not null);

create policy "insert_poll_votes" on poll_votes
  for insert with check (
    auth.uid() is not null and member_id = get_member_id()
  );

create policy "delete_poll_votes" on poll_votes
  for delete using (
    member_id = get_member_id()
  );

-- ============================================================================
-- poll_comments
-- ============================================================================
create policy "read_poll_comments" on poll_comments
  for select using (auth.uid() is not null and deleted_at is null);

create policy "insert_poll_comments" on poll_comments
  for insert with check (
    auth.uid() is not null and member_id = get_member_id()
  );

create policy "update_poll_comments" on poll_comments
  for update using (
    member_id = get_member_id() or is_admin()
  );

-- ============================================================================
-- calendar_availability
-- ============================================================================
create policy "read_calendar_availability" on calendar_availability
  for select using (auth.uid() is not null);

create policy "insert_calendar_availability" on calendar_availability
  for insert with check (
    auth.uid() is not null and member_id = get_member_id()
  );

create policy "delete_calendar_availability" on calendar_availability
  for delete using (
    member_id = get_member_id()
  );
