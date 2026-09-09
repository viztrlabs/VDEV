<#
.SYNOPSIS
    Kills all VizTR development servers (Next.js, Editor Engine, SuperSplat)
.DESCRIPTION
    Stops all node processes running on ports 3000, 3002, and 3487
.EXAMPLE
    .\scripts\kill-all.ps1
#>

$ports = @(3000, 3002, 3487)
$killed = $false

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  VizTR Dev Stack - Killing All Servers" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($port in $ports) {
    $pidsOnPort = netstat -ano | Select-String ":$port\s" | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique | Where-Object { $_ -ne "0" -and $_ -ne "" }
    
    foreach ($processId in $pidsOnPort) {
        try {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Killing PID $processId ($($proc.ProcessName)) on port $port..." -ForegroundColor Yellow
                taskkill /PID $processId /F 2>$null | Out-Null
                $killed = $true
            }
        } catch {
            Write-Host "Could not kill PID $processId on port $port" -ForegroundColor Red
        }
    }
}

# Also kill any orphaned node processes related to viztr
Write-Host ""
Write-Host "Checking for orphaned VizTR node processes..." -ForegroundColor Cyan

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcesses) {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
    if ($cmdLine -match "next dev|editor.server|serve.*3002|forks.splat.editor|playcanvas|viztr|rollup") {
        Write-Host "Killing orphan node PID $($proc.Id) ($($proc.ProcessName))..." -ForegroundColor Yellow
        taskkill /PID $proc.Id /F 2>$null | Out-Null
        $killed = $true
    }
}

Write-Host ""
if ($killed) {
    Write-Host "All VizTR servers stopped successfully." -ForegroundColor Green
} else {
    Write-Host "No VizTR servers were running." -ForegroundColor Green
}
Write-Host ""

Read-Host "Press Enter to exit"