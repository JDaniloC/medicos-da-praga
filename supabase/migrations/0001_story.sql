-- supabase/migrations/0001_story.sql
create table if not exists acts (
  act           integer primary key,
  title         text not null,
  start_node    text not null,
  world_context text not null default '',
  traits        jsonb not null default '[]',
  items         jsonb not null default '{}',
  badges        jsonb not null default '{}',
  updated_at    timestamptz not null default now()
);

create table if not exists scenes (
  act      integer not null references acts(act) on delete cascade,
  node_id  text not null,
  kind     text not null check (kind in ('scene','dice','ending')),
  data     jsonb not null,
  primary key (act, node_id)
);
