import { createServiceClient } from '@/lib/supabase/admin';

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

export function getServiceClient() {
  if (!stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '') || !stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY || '')) return null;
  return createServiceClient();
}
