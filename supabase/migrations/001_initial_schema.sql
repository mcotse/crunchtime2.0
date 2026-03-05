-- ============================================================================
-- Crunch Time: Initial Schema
-- 14 tables matching BACKEND_SPEC.md
-- ============================================================================

-- 1. members
create table members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) unique,
  name text not null,
  initials text not null,
  phone text default '',
  email text not null unique,
  color text not null default '#888888',
  balance numeric(10,2) default 0,
  is_admin boolean default false,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 2. polls (created before challenges due to FK from challenges.linked_poll_id)
create table polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  creator_id uuid references members(id) not null,
  expires_at timestamptz,
  is_archived boolean default false,
  archived_at timestamptz,
  allow_members_to_add_options boolean default false,
  allow_multi_select boolean default false,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 3. challenges
create table challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '',
  description text default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  fine_amount numeric(10,2) not null,
  status text not null check (status in ('active', 'completed', 'upcoming')),
  linked_poll_id uuid references polls(id) on delete set null,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 4. challenge_participants
create table challenge_participants (
  challenge_id uuid references challenges(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (challenge_id, member_id)
);

-- 5. transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('fine', 'expense')),
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  member_id uuid references members(id) not null,
  date timestamptz not null default now(),
  funding_source text check (funding_source in ('challenge', 'direct')),
  challenge_id uuid references challenges(id) on delete set null,
  fine_status text check (fine_status in ('paid', 'pending')),
  category text,
  split_locked boolean default false,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 6. transaction_splits
create table transaction_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade not null,
  member_id uuid references members(id) not null,
  share numeric(10,2) not null,
  is_payer boolean default false,
  guest_shares integer default 0
);

-- 7. transaction_attendees
create table transaction_attendees (
  transaction_id uuid references transactions(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  primary key (transaction_id, member_id)
);

-- 8. transaction_edit_history
create table transaction_edit_history (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade not null,
  edited_by uuid references members(id) not null,
  edited_at timestamptz default now(),
  change text not null
);

-- 9. events
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date_str text,
  time text,
  location text,
  location_maps_query text,
  creator_id uuid references members(id) not null,
  cover_emoji text default '',
  is_archived boolean default false,
  linked_transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 10. event_rsvps
create table event_rsvps (
  event_id uuid references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'not_going')),
  guest_count integer default 0,
  primary key (event_id, member_id)
);

-- 11. poll_options
create table poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- 12. poll_votes
create table poll_votes (
  poll_option_id uuid references poll_options(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (poll_option_id, member_id)
);

-- 13. poll_comments
create table poll_comments (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade not null,
  member_id uuid references members(id) not null,
  text text not null,
  created_at timestamptz default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

-- 14. calendar_availability
create table calendar_availability (
  date_str text not null,
  member_id uuid references members(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (date_str, member_id)
);
