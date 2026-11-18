-- Profiles: one row per auth user, readable and editable only by its owner.
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  primary key (id)
);

alter table public.profiles enable row level security;

-- Least privilege: no anon access. Signed-in users may read their row and
-- change only display_name. Rows are created by the trigger below.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when an auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- Trigger-only function: must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users that already exist.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
