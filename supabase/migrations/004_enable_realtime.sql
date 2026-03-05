-- Enable Supabase Realtime on all user-facing tables
-- This adds tables to the supabase_realtime publication so that
-- postgres_changes subscriptions in the frontend receive events.

-- First drop and recreate the publication to avoid "already exists" errors
-- when adding tables incrementally.
drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  transactions,
  transaction_splits,
  transaction_attendees,
  transaction_edit_history,
  events,
  event_rsvps,
  polls,
  poll_options,
  poll_votes,
  poll_comments,
  challenges,
  challenge_participants,
  calendar_availability;
