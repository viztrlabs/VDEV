-- VizTR Client Portal — seed data
-- Run after 20250101000000_init_clients_projects.sql
-- Seeds the in-memory data from app/api/clients/route.ts into Postgres so the
-- client portal works end-to-end after the first migration.

INSERT INTO public.clients (id, name, firm_name, email, phone, tier, active_projects, total_spend, status, portal_access_code, assigned_director, joined_date, notes, logo_url)
VALUES
  (
    'cli_01',
    'Alexander Sterling',
    'Foster + Partners London',
    'a.sterling@fosterpartners.com',
    '+44 20 7738 0455',
    'Enterprise VIP',
    3,
    '$420,000',
    'Active',
    'FST-2025-VTR',
    'Marcus Vance',
    '2024-03-15',
    'Primary focus on supertall tower architectural visualization and Unreal 5.4 Lumen interactive exhibitions.',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100'
  ),
  (
    'cli_02',
    'Helena Berg',
    'Snøhetta Oslo',
    'h.berg@snohetta.no',
    '+47 24 15 60 00',
    'Retainer Partner',
    2,
    '$290,000',
    'Active',
    'SNH-2025-VTR',
    'Sarah Lin',
    '2024-06-20',
    'Specializing in arctic and coastal biophilic structures with real-time daylight climate simulation.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100'
  ),
  (
    'cli_03',
    'Kenji Takahashi',
    'Kengo Kuma & Associates',
    'k.takahashi@kkaa.co.jp',
    '+81 3 5774 7722',
    'Enterprise VIP',
    1,
    '$180,000',
    'Active',
    'KMA-2025-VTR',
    'David Kalu',
    '2024-09-05',
    'Parametric cedar and bamboo pavilion studies with WebXR spatial viewing for museum stakeholders.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100'
  )
ON CONFLICT (id) DO NOTHING;
