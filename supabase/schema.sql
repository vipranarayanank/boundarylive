-- BoundaryLive database schema (safe to run on a fresh Supabase project)
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  match_title text not null default 'Cricket Live',
  video_id text not null default '',
  poll_question text not null default 'Who will win this match?',
  poll_options text[] not null default array['Team A','Team B','Tie'],
  poll_id uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.poll_votes (
  id bigint generated always as identity primary key,
  poll_id uuid not null,
  option_key text not null,
  voter_key uuid not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_key)
);
create table if not exists public.poll_counts (
  poll_id uuid not null,
  option_key text not null,
  vote_count bigint not null default 0 check (vote_count >= 0),
  primary key (poll_id, option_key)
);

alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.poll_votes enable row level security;
alter table public.poll_counts enable row level security;

drop policy if exists "Public can read active settings" on public.site_settings;
create policy "Public can read active settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins can update settings" on public.site_settings;
create policy "Admins can update settings" on public.site_settings for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can read admin membership" on public.admin_users;
create policy "Admins can read admin membership" on public.admin_users for select to authenticated using (user_id = auth.uid());

drop policy if exists "Public can cast one vote per poll token" on public.poll_votes;
create policy "Public can cast one vote per poll token" on public.poll_votes for insert to anon, authenticated
with check (exists (select 1 from public.site_settings s where s.id=1 and s.poll_id=poll_votes.poll_id and poll_votes.option_key=any(s.poll_options)));
drop policy if exists "Anyone can read poll totals" on public.poll_counts;
create policy "Anyone can read poll totals" on public.poll_counts for select to anon, authenticated using (true);

revoke all on public.poll_votes from anon, authenticated;
grant insert on public.poll_votes to anon, authenticated;
grant select on public.site_settings, public.poll_counts to anon, authenticated;
grant update on public.site_settings to authenticated;
grant select on public.admin_users to authenticated;

create or replace function private.increment_poll_count()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.poll_counts(poll_id,option_key,vote_count) values(new.poll_id,new.option_key,1)
  on conflict(poll_id,option_key) do update set vote_count=public.poll_counts.vote_count+1;
  return new;
end; $$;
revoke all on function private.increment_poll_count() from public, anon, authenticated;
drop trigger if exists poll_vote_increment_count on public.poll_votes;
create trigger poll_vote_increment_count after insert on public.poll_votes
for each row execute function private.increment_poll_count();

create or replace function private.seed_poll_counts()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.poll_counts(poll_id,option_key,vote_count)
  select new.poll_id,opt,0 from unnest(new.poll_options) as opt
  on conflict(poll_id,option_key) do nothing;
  return new;
end; $$;
revoke all on function private.seed_poll_counts() from public, anon, authenticated;
drop trigger if exists site_settings_seed_poll_counts on public.site_settings;
create trigger site_settings_seed_poll_counts after insert or update of poll_id,poll_options on public.site_settings
for each row execute function private.seed_poll_counts();

insert into public.poll_counts(poll_id,option_key,vote_count)
select s.poll_id,opt,0 from public.site_settings s cross join lateral unnest(s.poll_options) opt where s.id=1
on conflict(poll_id,option_key) do nothing;

create or replace function public.cast_poll_vote(p_poll_id uuid,p_option_key text,p_voter_key uuid)
returns void language plpgsql security invoker set search_path=public as $$
begin insert into public.poll_votes(poll_id,option_key,voter_key) values(p_poll_id,p_option_key,p_voter_key); end; $$;
revoke all on function public.cast_poll_vote(uuid,text,uuid) from public;
grant execute on function public.cast_poll_vote(uuid,text,uuid) to anon,authenticated;

create or replace function public.get_poll_results(p_poll_id uuid)
returns table(option_key text,vote_count bigint)
language sql stable security invoker set search_path=public as $$
select c.option_key,c.vote_count from public.poll_counts c join public.site_settings s on s.poll_id=c.poll_id
where s.id=1 and c.poll_id=p_poll_id order by array_position(s.poll_options,c.option_key);
$$;
revoke all on function public.get_poll_results(uuid) from public;
grant execute on function public.get_poll_results(uuid) to anon,authenticated;
