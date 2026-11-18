create table public.demo_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  answers jsonb not null,
  request_hash text not null,
  status text not null default 'pending' check (status in ('pending','approved','self_serve')),
  research_state text not null default 'queued' check (research_state in ('queued','running','complete','failed')),
  research_started_at timestamptz,
  research jsonb,
  reviewed_by text,
  reviewed_at timestamptz,
  notes text not null default '',
  invite_token_hash text unique,
  invite_expires_at timestamptz,
  email_state text not null default 'not_sent' check (email_state in ('not_sent','sending','sent','failed','unknown')),
  email_sent_at timestamptz,
  email_message_id text,
  crm_state text not null default 'pending' check (crm_state in ('pending','sent','failed'))
);
alter table public.demo_requests enable row level security;
revoke all on public.demo_requests from public, anon, authenticated;
grant select, insert, update, delete on public.demo_requests to service_role;
create index demo_requests_queue on public.demo_requests (created_at desc) where status = 'pending';
create index demo_requests_research on public.demo_requests (created_at) where research_state = 'queued';
