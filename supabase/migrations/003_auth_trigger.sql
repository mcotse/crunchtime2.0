-- ============================================================================
-- Auth trigger: link member on first login
-- When a new auth user signs up via magic link, match their email to a
-- pre-seeded member row and set auth_user_id.
-- ============================================================================

create or replace function link_member_on_login()
returns trigger as $$
begin
  update members
  set auth_user_id = new.id
  where email = new.email
    and auth_user_id is null;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_member_on_login();
