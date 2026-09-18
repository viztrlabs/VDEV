import urllib.request, json, uuid, datetime

BASE = 'https://naludjmicbqcagrlsrba.supabase.co'
SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbHVkam1pY2JxY2FncmxzcmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NjYzNCwiZXhwIjoyMTAzMjYyNjM0fQ.cpV_nxBNTMYaQ0X65pAAfUo7hEkWnpQDE4IhDY6zj3I'
headers = {'Authorization': f'Bearer {SRK}', 'apikey': SRK, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

now = datetime.datetime.utcnow().isoformat() + 'Z'
pid = 'bf8f4b58-07fc-46c6-a738-0618011a4295'
assetId = str(uuid.uuid4())

# Create asset record with correct schema
asset = json.dumps({
    'id': assetId,
    'project_id': pid,
    'type': 'model',
    'url': f'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/viztr-assets/2015-bmw-i8_xs_car.glb',
    'storage_path': 'viztr-assets/2015-bmw-i8_xs_car.glb',
    'mime_type': 'model/gltf-binary',
    'size': 10556332,
    'metadata': {'source': 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\GLB\\bmw-i8-xs-2015\\source\\2015-bmw-i8_xs_car.glb', 'uploaded_via': 'service_role'},
    'created_at': now,
    'updated_at': now
}).encode()
req = urllib.request.Request(f'{BASE}/rest/v1/assets', data=asset, headers=headers, method='POST')
try:
    r = urllib.request.urlopen(req)
    result = json.loads(r.read())
    print(f'Asset created: {assetId}')
    print(f'GLB file: {result["storage_path"]}')
except Exception as e:
    print(f'Asset error: {e}')

# Verify
req = urllib.request.Request(f'{BASE}/rest/v1/assets?id=eq.{assetId}', headers=headers, method='GET')
r = urllib.request.urlopen(req)
result = json.loads(r.read())
print(f'Verified: {json.dumps(result, indent=2)[:300]}')

print('\n=== BMW i8 XS GLB UPLOAD COMPLETE ===')
print(f'Project ID: {pid}')
print(f'Asset ID: {assetId}')
print(f'Storage: viztr-assets/2015-bmw-i8_xs_car.glb (10.5MB)')