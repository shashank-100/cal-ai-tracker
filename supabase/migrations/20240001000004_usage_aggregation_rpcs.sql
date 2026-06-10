create or replace function usage_summary()
returns table (total_input bigint, total_output bigint, total_tokens bigint, total_calls bigint)
language sql security definer as $$
  select
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    coalesce(sum(total_tokens), 0)::bigint,
    count(*)::bigint
  from usage_logs;
$$;

create or replace function usage_by_model()
returns table (model text, total_input bigint, total_output bigint, calls bigint)
language sql security definer as $$
  select
    model,
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    count(*)::bigint
  from usage_logs
  group by model;
$$;

create or replace function usage_by_purpose()
returns table (purpose text, total_input bigint, total_output bigint, calls bigint)
language sql security definer as $$
  select
    purpose,
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    count(*)::bigint
  from usage_logs
  group by purpose;
$$;
