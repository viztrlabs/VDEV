<# 
.SYNOPSIS
    Start all VizTR development services simultaneously
.DESCRIPTION
    Launches: Next.js App (3000), Editor Engine (3487), SuperSplat (3002), Splat Editor Watcher
.NOTES
    Requires: concurrently, serve (installed via npm)
#>

param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$projectRoot = "C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  VizTR Dev Stack - Starting All Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes on our ports
$ports = @(3000, 3002, 3487)
foreach ($port in $ports) {
    $pids = netstat -ano | Select-String ":$port\s" | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -ne "0" -and $pid -ne "") {
            try { taskkill /PID $pid /F 2>$null | Out-Null } catch {}
        }
    }
}

Write-Host "🧹 Cleaned up existing processes on ports 3000, 3002, 3487" -ForegroundColor Green

# Change to project root
Set-Location $projectRoot

# Check if node_modules exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "forks\editor\server\node_modules")) {
    Write-Host "📦 Installing editor server dependencies..." -ForegroundColor Yellow
    npm install --prefix forks\editor\server
}

# Start all services using concurrently
Write-Host ""
Write-Host "🚀 Starting all services..." -ForegroundColor Cyan
Write-Host ""

$concurrentlyArgs = @(
    "npm run dev:splat-editor",           # Next.js (3000) + Splat Editor Watcher
    "npm run dev --prefix forks\editor\server",  # Editor Engine (3487)
    "npx serve -s forks\supersplat\dist -l 3002"  # SuperSplat (3002)
)

# Build the concurrently command
$cmd = "npx concurrently --kill-others-on-fail --prefix-colors cyan,green,magenta --prefix '[{name}]' --names 'NEXT,ENGINE,SUPERSPLAT' "
$cmd += ($concurrentlyArgs | ForEach-Object { "`"$_`"" }) -join " "

Write-Host "Command: $cmd" -ForegroundColor Gray
Write-Host ""

# Execute
try {
    Invoke-Expression $cmd
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Trying alternative approach..." -ForegroundColor Yellow
    
    # Fallback: start each in separate background jobs
    $jobs = @()
    $jobs += Start-Job -ScriptBlock { Set-Location $using:projectRoot; npm run dev:splat-editor } -Name "NextJS+SplatEditor"
    $jobs += Start-Job -ScriptBlock { Set-Location "$using:projectRoot\forks\editor\server"; npm run dev } -Name "EditorEngine"
    $jobs += Start-Job -ScriptBlock { Set-Location "$using:projectRoot\forks\supersplat"; npx serve -s dist -l 3002 } -Name "SuperSplat"
    
    Write-Host "Started background jobs. Press Ctrl+C to stop all." -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  📱 Next.js App:         http://localhost:3000" -ForegroundColor White
    Write-Host "  🎮 Editor Engine:       http://localhost:3487" -ForegroundColor White
    Write-Host "  🎨 SuperSplat Editor:   http://localhost:3002" -ForegroundColor White
    Write-Host ""
    Write-Host "Key Pages:" -ForegroundColor Cyan
    Write-Host "  🏠 XR World Hub:        http://localhost:3000/xr-world" -ForegroundColor White
    Write-Host "  🎯 VizSplat Showcase:   http://localhost:3000/xr-world/vizsplat" -ForegroundColor White
    Write-Host "  ✏️  VizSplat Editor:     http://localhost:3000/xr-world/vizsplat/editor" -ForegroundColor White
    Write-Host "  🛠️  XR Editor (PlayCanvas): http://localhost:3487/editor/scene/1" -ForegroundColor White
    Write-Host ""
    
    try {
        Wait-Job -Job $jobs -Timeout 86400
    } catch {
        Write-Host "`n🛑 Stopping all services..." -ForegroundColor Yellow
        $jobs | Stop-Job
        $jobs | Remove-Job
    }
}