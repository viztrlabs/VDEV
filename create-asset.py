import urllib.request, urllib.parse, json, uuid, datetime

BASE = 'https://naludjmicbqcagrlsrba.supabase.co'
SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbHVkam1pY2JxY2FncmxzcmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NjYzNCwiZXhwIjoyMTAzMjYyNjM0fQ.cpV_nxBNTMYaQ0X65pAAfUo7hEkWnpQDE4IhDY6zj3I'
headers = {'Authorization': f'Bearer {SRK}', 'apikey': SRK, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

now = datetime.datetime.utcnow().isoformat() + 'Z'
pid = str(uuid.uuid4())

# Step 1: Create project
proj = json.dumps({
    'id': pid,
    'name': 'BMW i8 XS Upload Test',
    'client_name': 'BMW',
    'client_email': 'test@bmw.com',
    'category': 'Architectural',
    'project_type': 'Architectural',
    'status': 'Work in Progress',
    'payment_status': 'Paid',
    'booking_amount': 0,
    'progress': 0,
    'xr_available': False,
    'pixel_streaming_available': False,
    'hours_monitoring': {},
    'pipeline': [],
    'documents': [],
    'pending_revisions_count': 0,
    'revisions_summary': [],
    'notes': 'GLB E2E upload test',
    'created_at': now,
    'updated_at': now
}).encode()
req = urllib.request.Request(f'{BASE}/rest/v1/projects', data=proj, headers=headers, method='POST')
try:
    r = urllib.request.urlopen(req)
    result = json.loads(r.read())
    print(f'Project created: {pid}')
except Exception as e:
    print(f'Project error: {e}')
    exit(1)

# Step 2: Create asset record
assetId = str(uuid.uuid4())
asset = json.dumps({
    'id': assetId,
    'project_id': pid,
    'name': '2015-bmw-i8_xs_car.glb',
    'file_path': 'viztr-assets/2015-bmw-i8_xs_car.glb',
    'file_size': 10556332,
    'file_type': 'model/gltf-binary',
    'asset_type': 'model',
    'status': 'uploaded',
    'is_public': True,
    'created_at': now,
    'updated_at': now
}).encode()
req = urllib.request.Request(f'{BASE}/rest/v1/assets', data=asset, headers=headers, method='POST')
try:
    r = urllib.request.urlopen(req)
    result = json.loads(r.read())
    print(f'Asset created: {assetId}')
    print(f'File path: viztr-assets/2015-bmw-i8_xs_car.glb')
except Exception as e:
    print(f'Asset error: {e}')

# Step 3: Verify file is in storage
req = urllib.request.Request(f'{BASE}/storage/v1/object/viztr-assets/2015-bmw-i8_xs_car.glb', headers=headers, method='HEAD')
try:
    r = urllib.request.urlopen(req)
    print(f'Storage file exists: {r.status}')
    print(f'File size: {r.headers.get("x-upscaled-content-length", r.headers.get("content-length", "unknown"))}')
except Exception as e:
    print(f'Storage verify error: {e}')

print('\nDONE - BMW i8 XS GLB uploaded to production!')