# scripts/safe-build.ps1
# Runs a production build without corrupting the dev server's .next chunks.
#
# Why: `next build` and `next dev` share the same .next directory. Building
# while the dev server is live overwrites its chunk manifests mid-flight and
# causes "Cannot read properties of undefined (reading 'call')" on dev pages.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1 -KeepDevStopped   # build only
param(
  [switch]$KeepDevStopped
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ports = @(3000, 3002, 3487)

function Get-DevPids {
  Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
}

$wasRunning = $null -ne (Get-DevPids)

if ($wasRunning) {
  Write-Host '[safe-build] Stopping dev server (ports 3000/3002/3487)...'
  Get-DevPids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  $deadline = (Get-Date).AddSeconds(15)
  while ((Get-Date) -lt $deadline) {
    if ($null -eq (Get-DevPids)) { break }
    Start-Sleep -Milliseconds 500
  }
}

$buildOk = $true
Write-Host '[safe-build] Running pnpm run build...'
Push-Location $root
try {
  pnpm run build
  if ($LASTEXITCODE -ne 0) { $buildOk = $false }
} finally {
  Pop-Location
}

# Always bring the dev server back (it was stopped only for the build).
if ($wasRunning -and -not $KeepDevStopped) {
  Write-Host '[safe-build] Restarting dev server...'
  $dataDir = Join-Path $root '.data'
  if (-not (Test-Path -LiteralPath $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
  }
  Start-Process cmd -ArgumentList '/c', 'pnpm run dev:all > .data\dev-server.log 2>&1' `
    -WorkingDirectory $root -WindowStyle Hidden
  Write-Host '[safe-build] Dev server restarting (log: .data/dev-server.log)'
}

if (-not $buildOk) {
  Write-Error '[safe-build] BUILD FAILED — see output above.'
  exit 1
}
Write-Host '[safe-build] Done.'