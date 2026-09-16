-- Phase 1.1: Booking System
-- Bookings table with admin approval workflow

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('Architectural', 'Virtual Reality', 'Pixel Streaming', 'WebXR', 'WebAR', 'Virtual Tour 360', 'Animation', 'Still Renders', 'Other')),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  company text,
  project_description text,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  timezone text DEFAULT 'UTC',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  admin_notes text,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejected_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_client_email_idx ON public.bookings (client_email);
CREATE INDEX IF NOT EXISTS bookings_preferred_date_idx ON public.bookings (preferred_date);
CREATE INDEX IF NOT EXISTS bookings_service_type_idx ON public.bookings (service_type);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at DESC);

-- RLS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can do everything
DROP POLICY IF EXISTS "Admins full access bookings" ON public.bookings;
CREATE POLICY "Admins full access bookings"
  ON public.bookings FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- Clients can read their own bookings
DROP POLICY IF EXISTS "Clients read own bookings" ON public.bookings;
CREATE POLICY "Clients read own bookings"
  ON public.bookings FOR SELECT
  USING (auth.jwt() ->> 'role' = 'client' AND client_email = auth.jwt() ->> 'email');

-- Anon users can create bookings (for contact form)
DROP POLICY IF EXISTS "Anon create bookings" ON public.bookings;
CREATE POLICY "Anon create bookings"
  ON public.bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- Auto-update trigger
DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Notification trigger for new bookings (optional - can be handled in API)
-- This would typically be handled in the API layer for email notifications