create table if not exists app_state (
  id text primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_state_updated_at on app_state(updated_at desc);

alter table app_state disable row level security;

insert into app_state (id, state)
values (
  'main',
  '{}'::jsonb
)
on conflict (id) do nothing;
