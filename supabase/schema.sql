-- Signal Board cloud storage. Run once in Supabase → SQL Editor.
-- One row per account holding the whole board as JSON. `version` goes up by
-- one on every save so two devices can't silently overwrite each other.

create table if not exists public.boards (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  version    bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.boards enable row level security;

-- Each signed-in user can only see and change their own row.
drop policy if exists "boards_select_own" on public.boards;
create policy "boards_select_own" on public.boards
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "boards_insert_own" on public.boards;
create policy "boards_insert_own" on public.boards
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "boards_update_own" on public.boards;
create policy "boards_update_own" on public.boards
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
