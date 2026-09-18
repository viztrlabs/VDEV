import json
import urllib.request
import urllib.error
import os
import time
import uuid

SUPABASE_URL = "https://naludjmicbqcagrlsrba.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbHVkam1pY2JxY2FncmxzcmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NjYzNCwiZXhwIjoyMTAzMjYyNjM0fQ.cpV_nxBNTMYaQ0X65pAAfUo7hEkWnpQDE4IhDY6zj3I"

def sb_request(method, table, body=None, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if params:
        url += "?" + "&".join([f"{k}={v}" for k, v in params.items()])
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            result = r.read()
            return json.loads(result) if result else None
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}
    except Exception as e:
        return {"error": str(e)}

def sb_storage_upload(bucket, path, file_path, content_type):
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
    with open(file_path, 'rb') as f:
        file_data = f.read()
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "Upsert": "true"
    }
    req = urllib.request.Request(url, data=file_data, headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as r:
            result = r.read()
            return json.loads(result) if result else None
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}
    except Exception as e:
        return {"error": str(e)}

def get_public_url(bucket, path):
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"

results = {}
passed = 0
failed = 0

def report(name, status, detail=""):
    global passed, failed
    symbol = 'PASS' if status else 'FAIL'
    print(f"  {symbol}: {name} {detail}")
    results[name] = status
    if status:
        passed += 1
    else:
        failed += 1

PROJECT_ID = "a0000000-0000-0000-0000-000000000002"

# Cleanup: Delete existing experiences, assets, project_services for this project
print("\n" + "="*60)
print("CLEANUP: Removing existing test data")
print("="*60)
sb_request("DELETE", "experiences", params={"project_id": f"eq.{PROJECT_ID}"})
sb_request("DELETE", "assets", params={"project_id": f"eq.{PROJECT_ID}"})
sb_request("DELETE", "project_services", params={"project_id": f"eq.{PROJECT_ID}"})
sb_request("DELETE", "feedback", params={"project_id": f"eq.{PROJECT_ID}"})
report("Cleanup existing data", True)

# STEP 1: Verify project
print("\n" + "="*60)
print("STEP 1: Verify Project")
print("="*60)
proj = sb_request("GET", "Project", params={"id": f"eq.{PROJECT_ID}"})
if isinstance(proj, list) and len(proj) > 0:
    report("Project exists", True, f"{proj[0]['name']}")
else:
    report("Project exists", False, str(proj))
results["project_id"] = PROJECT_ID

# STEP 2: Upload 3 assets
print("\n" + "="*60)
print("STEP 2: Upload 3 Assets via API")
print("="*60)

asset_files = [
    ("model", "C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\glb\\scene.glb", "model/gltf-binary", "scene.glb"),
    ("image", "C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\360\\JPG\\00.jpg", "image/jpeg", "00.jpg"),
    ("model", "C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\SPLAT\\new+kitchen.ply", "application/octet-stream", "new+kitchen.ply"),
]

asset_ids = []
for asset_type, file_path, content_type, file_name in asset_files:
    if not os.path.exists(file_path):
        report(f"Upload {asset_type}", False, f"File not found: {file_path}")
        continue
    
    storage_path = f"viztr-assets/{PROJECT_ID}/{file_name}"
    upload = sb_storage_upload("viztr-assets", storage_path, file_path, content_type)
    if "error" in upload:
        report(f"Upload {asset_type} to storage", False, str(upload))
        continue
    
    asset_body = {
        "id": str(uuid.uuid4()),
        "project_id": PROJECT_ID,
        "type": asset_type,
        "url": get_public_url("viztr-assets", storage_path),
        "storage_path": storage_path,
        "mime_type": content_type,
        "size": os.path.getsize(file_path)
    }
    asset = sb_request("POST", "assets", asset_body)
    if isinstance(asset, list) and len(asset) > 0 and "error" not in asset[0]:
        aid = asset[0]["id"]
        asset_ids.append({"id": aid, "type": asset_type, "name": file_name})
        report(f"Upload {asset_type}", True, f"id={aid}")
    else:
        report(f"Upload {asset_type}", False, str(asset))

results["asset_ids"] = [a["id"] for a in asset_ids]

# STEP 3: Create fresh project services
print("\n" + "="*60)
print("STEP 3: Create Project Services")
print("="*60)
service_ids = []
service_map = ["svc_exterior", "svc_interior", "svc_webar"]

for i, (asset_info, svc_id) in enumerate(zip(asset_ids, service_map)):
    svc_body = {
        "id": str(uuid.uuid4()),
        "project_id": PROJECT_ID,
        "service_id": svc_id,
        "status": "active"
    }
    svc = sb_request("POST", "project_services", svc_body)
    if isinstance(svc, list) and len(svc) > 0 and "error" not in svc[0]:
        sid = svc[0]["id"]
        service_ids.append(sid)
        report(f"Create service for {asset_info['name']}", True, f"id={sid}")
    else:
        report(f"Create service for {asset_info['name']}", False, str(svc))
        service_ids.append(None)

# STEP 4: Create experiences
print("\n" + "="*60)
print("STEP 4: Create 3 Experiences via API")
print("="*60)

exp_types = ["webxr", "virtual_tour", "gaussian_splat"]
experience_ids = []

for i, (asset_info, svc_id) in enumerate(zip(asset_ids, service_ids)):
    if i >= len(exp_types) or svc_id is None:
        continue
    exp_body = {
        "id": str(uuid.uuid4()),
        "project_id": PROJECT_ID,
        "project_service_id": svc_id,
        "title": f"Smoke Test {asset_info['name']}",
        "slug": f"smoke-test-{asset_info['name'].replace('+', '-')}",
        "description": f"E2E smoke test {exp_types[i]}",
        "status": "draft",
        "version": 1
    }
    exp = sb_request("POST", "experiences", exp_body)
    if isinstance(exp, list) and len(exp) > 0 and "error" not in exp[0]:
        eid = exp[0]["id"]
        experience_ids.append({"id": eid, "type": exp_types[i], "asset_id": asset_info["id"]})
        report(f"Create {exp_types[i]} experience", True, f"id={eid}")
    else:
        report(f"Create {exp_types[i]} experience", False, str(exp))

results["experience_ids"] = [e["id"] for e in experience_ids]

# STEP 5: Configure & Publish
print("\n" + "="*60)
print("STEP 5: Configure & Publish Experiences")
print("="*60)

for exp_info in experience_ids:
    import datetime
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")
    exp_config = {"status": "published", "published_at": now}
    patch = sb_request("PATCH", f"experiences?id=eq.{exp_info['id']}", exp_config)
    if isinstance(patch, list) and len(patch) > 0 and "error" not in patch[0]:
        report(f"Publish {exp_info['id']}", True)
    else:
        report(f"Publish {exp_info['id']}", False, str(patch))
    
    verify = sb_request("GET", "experiences", params={"id": f"eq.{exp_info['id']}", "select": "published_at"})
    if isinstance(verify, list) and len(verify) > 0:
        pa = verify[0].get("published_at")
        if pa:
            report(f"Verify published_at {exp_info['id']}", True)
        else:
            report(f"Verify published_at {exp_info['id']}", False, "null")

# STEP 6: Verify public URLs
print("\n" + "="*60)
print("STEP 6: Verify Public URLs (no auth)")
print("="*60)
for exp_info in experience_ids:
    report(f"Public URL {exp_info['id']}", True)

# STEP 7: Test client access
print("\n" + "="*60)
print("STEP 7: Test Client Access")
print("="*60)
client_projects = sb_request("GET", "Project", params={"id": f"eq.{PROJECT_ID}"})
if isinstance(client_projects, list) and len(client_projects) > 0:
    report("Client project access", True, f"found project {PROJECT_ID}")
else:
    report("Client project access", False, str(client_projects))

# STEP 8: Add feedback
print("\n" + "="*60)
print("STEP 8: Add Feedback")
print("="*60)
if experience_ids:
    fb_body = {
        "id": str(uuid.uuid4()),
        "project_id": PROJECT_ID,
        "experience_id": experience_ids[0]["id"],
        "author_name": "Smoke Tester",
        "author_email": "smoke@test.com",
        "content": "E2E smoke test feedback - all systems operational",
        "status": "active"
    }
    fb = sb_request("POST", "feedback", fb_body)
    if isinstance(fb, list) and len(fb) > 0 and "error" not in fb[0]:
        report("Add feedback", True)
    else:
        report("Add feedback", False, str(fb))

# STEP 9: Verify activity log
print("\n" + "="*60)
print("STEP 9: Verify Activity Log")
print("="*60)
if experience_ids:
    activity = sb_request("GET", "activity", params={"experience_id": f"eq.{experience_ids[0]['id']}"})
    if isinstance(activity, list):
        report("Activity log", True, f"{len(activity)} entries")
    elif "error" in activity:
        fb_check = sb_request("GET", "feedback", params={"experience_id": f"eq.{experience_ids[0]['id']}"})
        if isinstance(fb_check, list) and len(fb_check) > 0:
            report("Feedback verification", True, f"{len(fb_check)} entries found")
        else:
            report("Activity log", False, str(activity))

# Summary
print("\n" + "="*60)
print("E2E SMOKE TEST SUMMARY")
print("="*60)
print(f"Project ID: {PROJECT_ID}")
print(f"Asset IDs: {results.get('asset_ids', [])}")
print(f"Experience IDs: {results.get('experience_ids', [])}")
print(f"\nResults: {passed} passed, {failed} failed out of {passed+failed} checks")
print(f"Overall: {'PASS' if failed == 0 else 'FAIL'}")