import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://ncekoxdqjqfbkqrunezf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZWtveGRxanFmYmtxcnVuZXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUxMzkzOSwiZXhwIjoyMDcyMDg5OTM5fQ.YoOunxXqG18G9EiM4Wwu3dv0kVD4NFe5zreVlh3-WU0"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
