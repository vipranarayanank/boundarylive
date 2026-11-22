-- BoundaryLive database schema
create extension if not exists pgcrypto;

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

alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.poll_votes enable row level security;

drop policy if exists "Public can read active settings" on public.site_settings;
create policy "Public can read active settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins can update settings" on public.site_settings;
create policy "Admins can update settings" on public.site_settings for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can read admin membership" on public.admin_users;
create policy "Admins can read admin membership" on public.admin_users for select to authenticated using (user_id = auth.uid());

create or replace function public.cast_poll_vote(p_poll_id uuid, p_option_key text, p_voter_key uuid)
returns void language plpgsql security definer set search_path = public as $$
declare active_poll uuid; allowed boolean;
begin
  select poll_id, p_option_key = any(poll_options) into active_poll, allowed
  from public.site_settings where id = 1;
  if active_poll is distinct from p_poll_id or not coalesce(allowed,false) then
    raise exception 'This poll is no longer active.';
  end if;
  insert into public.poll_votes(poll_id, option_key, voter_key) values (p_poll_id,p_option_key,p_voter_key);
end; $$;

create or replace function public.get_poll_results(p_poll_id uuid)
returns table(option_key text, vote_count bigint)
language sql stable security definer set search_path = public as $$
  select opt, count(v.id)::bigint
  from public.site_settings s
  cross join lateral unnest(s.poll_options) opt
  left join public.poll_votes v on v.poll_id = s.poll_id and v.option_key = opt
  where s.id = 1 and s.poll_id = p_poll_id
  group by opt, array_position(s.poll_options,opt)
  order by array_position(s.poll_options,opt);
$$;

revoke all on function public.cast_poll_vote(uuid,text,uuid) from public;
grant execute on function public.cast_poll_vote(uuid,text,uuid) to anon, authenticated;
revoke all on function public.get_poll_results(uuid) from public;
grant execute on function public.get_poll_results(uuid) to anon, authenticated;

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant select on public.admin_users to authenticated;
