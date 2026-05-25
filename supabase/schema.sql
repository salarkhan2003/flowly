-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  settings jsonb not null default '{
    "ai_provider": "grok",
    "theme": "dark",
    "notifications_enabled": true,
    "daily_brief_time": "08:00"
  }'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can manage own profile" on profiles
  for all using (auth.uid() = id);

-- ─── Notes ───────────────────────────────────────────────────────────────────
create table if not exists notes (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  attachments jsonb not null default '[]'::jsonb,
  linked_note_ids text[] not null default '{}',
  project_id text,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

alter table notes enable row level security;
create policy "Users can manage own notes" on notes
  for all using (auth.uid() = user_id);

create index notes_user_id_idx on notes(user_id);
create index notes_updated_at_idx on notes(updated_at desc);

-- ─── Tasks ───────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  priority text not null default 'none' check (priority in ('high','medium','low','none')),
  due_date timestamptz,
  reminder_at timestamptz,
  recurring text check (recurring in ('daily','weekly','monthly','yearly')),
  subtasks jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  project_id text,
  note_id text,
  is_starred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table tasks enable row level security;
create policy "Users can manage own tasks" on tasks
  for all using (auth.uid() = user_id);

create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(due_date);
create index tasks_status_idx on tasks(status);

-- ─── Projects ────────────────────────────────────────────────────────────────
create table if not exists projects (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#00FF9D',
  icon text not null default '🚀',
  status text not null default 'active' check (status in ('active','on_hold','completed','archived')),
  due_date timestamptz,
  task_ids text[] not null default '{}',
  note_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;
create policy "Users can manage own projects" on projects
  for all using (auth.uid() = user_id);

-- ─── Calendar Events ─────────────────────────────────────────────────────────
create table if not exists calendar_events (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  color text not null default '#00FF9D',
  task_id text,
  project_id text,
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;
create policy "Users can manage own events" on calendar_events
  for all using (auth.uid() = user_id);

-- ─── Updated at trigger ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at before update on notes
  for each row execute function update_updated_at();

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();
