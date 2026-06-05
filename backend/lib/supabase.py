from supabase import create_client, Client
from .config import settings

# Regular client (respects RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)

# Admin client (bypasses RLS — server-side only)
admin_supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
