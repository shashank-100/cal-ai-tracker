create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  model text not null,
  purpose text not null,
  input_tokens int not null,
  output_tokens int not null,
  total_tokens int not null
);

alter table usage_logs enable row level security;
