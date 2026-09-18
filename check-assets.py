import urllib.request, json

BASE = 'https://naludjmicbqcagrlsrba.supabase.co'
SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbHVkam1pY2JxY2FncmxzcmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NjYzNCwiZXhwIjoyMTAzMjYyNjM0fQ.cpV_nxBNTMYaQ0X65pAAfUo7hEkWnpQDE4IhDY6zj3I'
headers = {'Authorization': f'Bearer {SRK}', 'apikey': SRK, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

# Check assets table schema
req = urllib.request.Request(f'{BASE}/rest/v1/assets?select=*', headers=headers, method='GET')
r = urllib.request.urlopen(req)
result = json.loads(r.read())
print(f'Columns: {list(result[0].keys()) if result else "empty"}')
print(f'Sample: {json.dumps(result[0], indent=2)[:500] if result else "none"}')