$baseUrl = "https://viztr.vercel.app"
$csrfToken = "3eb6501b359b26f4a7ea7143953bf7f3da80cde1c967e24332ab3b78982924ad"
$glbPath = "C:\Users\Arch_Viz\Desktop\Portfolio\GLB\bmw-i8-xs-2015\source\2015-bmw-i8_xs_car.glb"

# Step 1: Get CSRF
Write-Host "=== Step 1: Get CSRF Token ==="
$csrf = curl.exe -s "$baseUrl/api/auth/csrf"
Write-Host $csrf

# Step 2: Sign in via credentials callback
Write-Host "`n=== Step 2: Sign in ==="
curl.exe -s -c "cookies.txt" -X POST "$baseUrl/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" -d "email=admin@viztr.com&password=password123&callbackUrl=https://viztr.vercel.app/admin/dashboard" -o /dev/null -w "%{http_code}`n"

# Step 3: Follow redirect to get session
curl.exe -s -b "cookies.txt" -c "cookies.txt" -L "$baseUrl/api/auth/callback/credentials" -o /dev/null -w "%{http_code}`n"

# Step 4: Verify session by checking admin endpoint
Write-Host "`n=== Step 3: Verify session ==="
$verification = curl.exe -s -b "cookies.txt" "$baseUrl/api/admin/stats" -w "%{http_code}"
Write-Host $verification

# Step 5: Create project
Write-Host "`n=== Step 4: Create project ==="
$projectResult = curl.exe -s -b "cookies.txt" -X POST "$baseUrl/api/admin/projects" -H "Content-Type: application/json" -d "{\"name\":\"BMW i8 XS Upload Test\",\"clientName\":\"BMW\",\"description\":\"GLB upload E2E test\"}"
Write-Host $projectResult

# Step 6: Upload GLB file
Write-Host "`n=== Step 5: Upload GLB file ==="
$uploadResult = curl.exe -s -b "cookies.txt" -X POST "$baseUrl/api/admin/projects/$projectId/assets" -F "file=@`"$glbPath`"" -F "type=model"
Write-Host $uploadResult

Write-Host "`nDone!"