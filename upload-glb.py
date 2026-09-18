import urllib.request
import urllib.parse
import json
import http.cookiejar
import os

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]

BASE = 'https://viztr.vercel.app'

# Step 1: Get CSRF
r = opener.open(BASE + '/api/auth/csrf')
csrf = json.loads(r.read())['csrfToken']
print(f'CSRF: {csrf}')

# Step 2: Login - follow redirect to get session cookie
data = urllib.parse.urlencode({
    'email': 'admin@viztr.com',
    'password': 'password123',
    'callbackUrl': 'https://viztr.vercel.app/admin/dashboard'
}).encode()
req = urllib.request.Request(BASE + '/api/auth/callback/credentials', data=data, method='POST')
r = opener.open(req)
# Read response to trigger redirect following
body = r.read()
print(f'Login status: {r.status}')
print(f'Final URL: {r.geturl()}')
print(f'Cookies: {[c.name for c in cj]}')

# Check if we have a session token
session_cookies = [c for c in cj if 'session' in c.name.lower()]
print(f'Session cookies: {[(c.name, c.value[:20]) for c in session_cookies]}')

if not session_cookies:
    # Try manual redirect following
    print('No session cookie - trying redirect manually...')
    # The callback redirects to /api/auth/callback?callbackUrl=... which sets session
    redirect_url = BASE + '/api/auth/callback?callbackUrl=https%3A%2F%2Fviztr.vercel.app%2Fadmin%2Fdashboard'
    r2 = opener.open(redirect_url)
    print(f'Redirect status: {r2.status}')
    print(f'Cookies after redirect: {[c.name for c in cj]}')
    body = r2.read()

# Step 3: Create project
proj_data = json.dumps({
    'name': 'BMW i8 XS Upload Test',
    'clientName': 'BMW',
    'description': 'GLB E2E upload test'
}).encode()
req = urllib.request.Request(BASE + '/api/admin/projects', data=proj_data, headers={'Content-Type': 'application/json'}, method='POST')
r = opener.open(req)
result = json.loads(r.read())
print(f'Project result: {json.dumps(result, indent=2)[:500]}')
pid = result.get('data', {}).get('id')
print(f'Project ID: {pid}')

if not pid:
    print('Failed to get project ID')
    exit(1)

# Step 4: Upload GLB
glb_path = r'C:\Users\Arch_Viz\Desktop\Portfolio\GLB\bmw-i8-xs-2015\source\2015-bmw-i8_xs_car.glb'
with open(glb_path, 'rb') as f:
    body = f.read()

req = urllib.request.Request(
    f'{BASE}/api/admin/projects/{pid}/assets',
    data=body,
    headers={
        'Content-Type': 'application/octet-stream',
        'X-Asset-Name': '2015-bmw-i8_xs_car.glb',
        'X-Asset-Type': 'model'
    },
    method='POST'
)
r = opener.open(req)
result = json.loads(r.read())
print(f'Upload result: {json.dumps(result, indent=2)[:500]}')
print('DONE')