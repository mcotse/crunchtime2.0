-- Fix auth trigger for hosted Supabase
-- The trigger needs explicit search_path and proper error handling
create or replace function link_member_on_login()
returns trigger as $$
begin
  update public.members
  set auth_user_id = new.id
  where email = new.email
    and auth_user_id is null;
  return new;
exception when others then
  -- Don't block user creation if member linking fails
  return new;
end;
$$ language plpgsql security definer set search_path = public;
