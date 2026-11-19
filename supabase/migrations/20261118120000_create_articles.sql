-- Articles: converted pages a signed-in user saved. Readable and writable only by its owner.
create table public.articles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url text not null,
  title text not null,
  author text not null default '',
  site text not null default '',
  published text not null default '',
  markdown text not null,
  saved_at timestamptz not null default now(),
  primary key (id),
  -- Saving the same URL again updates the existing row.
  unique (user_id, url)
);

create index articles_user_saved_at_idx on public.articles (user_id, saved_at desc);

alter table public.articles enable row level security;

-- Least privilege: no anon access. Signed-in users may read, insert, and
-- update only their own rows. Deleting is out of scope for now.
revoke all on public.articles from anon, authenticated;
grant select, insert, update on public.articles to authenticated;
grant select, insert, update, delete on public.articles to service_role;

create policy "articles_select_own" on public.articles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "articles_insert_own" on public.articles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "articles_update_own" on public.articles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
