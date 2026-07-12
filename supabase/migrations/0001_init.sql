-- SuccessLoop 초기 스키마 (PRD §3-3)
-- 모든 사용자 데이터 테이블은 RLS로 "본인 행만" 접근.
-- 관리자 집계(§4-5)는 서비스 롤 또는 별도 정책으로 추후 처리.

-- ─────────────────────────────────────
-- profiles (auth.users 1:1)
-- ─────────────────────────────────────
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  nickname       text,
  pin_hash       text,
  role           text not null default 'user' check (role in ('user', 'admin')),
  onboarding_step text not null default 'not_started',
  marketing_opt_in boolean not null default false,
  last_active_at timestamptz,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────
-- 1단계: 목표 설정 (버전 보존)
-- ─────────────────────────────────────
create table if not exists public.roadmap_versions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  version_no int not null default 1,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dislikes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  version_id bigint not null references public.roadmap_versions (id) on delete cascade,
  content    text not null,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  version_id bigint not null references public.roadmap_versions (id) on delete cascade,
  content    text not null,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.compass (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  version_id bigint not null references public.roadmap_versions (id) on delete cascade,
  content    text,
  created_at timestamptz not null default now()
);

create table if not exists public.realizations (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  version_id bigint not null references public.roadmap_versions (id) on delete cascade,
  content    text not null,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────
-- 2단계: 잠재의식 Daily on (SMART)
-- ─────────────────────────────────────
create table if not exists public.short_term_goals (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  date         date not null,
  no           int not null check (no between 1 and 10),
  specific     text,
  measurable   text,
  agreed       text,
  realistic    text,
  timely       text,
  is_important boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.daily_actions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  content    text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────
-- 알림 / 리마인드
-- ─────────────────────────────────────
create table if not exists public.reminder_settings (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  morning_at          time,
  night_at            time,
  random_enabled      boolean not null default false,
  random_per_day      int not null default 3,
  random_window_start time not null default '09:00',
  random_window_end   time not null default '21:00',
  dnd_start           time not null default '23:00',
  dnd_end             time not null default '07:00',
  timezone            text not null default 'Asia/Seoul',
  next_random_at      timestamptz
);

create table if not exists public.push_subscriptions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────
-- 분석 / 문의
-- ─────────────────────────────────────
create table if not exists public.usage_events (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  event_type text not null,
  meta       jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        text not null,
  content     text not null,
  status      text not null default 'received' check (status in ('received', 'in_progress', 'done')),
  admin_reply text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────
-- RLS: 본인 행만 접근
-- ─────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','roadmap_versions','dislikes','likes','compass','realizations',
    'short_term_goals','daily_actions','reminder_settings','push_subscriptions',
    'usage_events','inquiries'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- profiles 는 PK 가 user_id
create policy "own_profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 나머지 테이블은 user_id 컬럼 기준
do $$
declare t text;
begin
  foreach t in array array[
    'roadmap_versions','dislikes','likes','compass','realizations',
    'short_term_goals','daily_actions','reminder_settings','push_subscriptions',
    'usage_events','inquiries'
  ]
  loop
    execute format(
      'create policy "own_rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
