import { createServiceClient } from '@/lib/supabase/admin';

export function getServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createServiceClient();
}
