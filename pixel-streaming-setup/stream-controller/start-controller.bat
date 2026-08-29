@echo off
REM VizTR Stream Controller — GPU-PC sidecar
REM Runs next to the UE5 Pixel Streaming build + Cirrus. The VizTR Next.js
REM backend proxies /api/pixel-streaming/* here.
REM
REM Set UE5_EXE to your packaged build to go LIVE:
REM   set UE5_EXE=C:\VizTR\Builds\ApexTower\Windows\ApexTower.exe
REM   set CIRRUS_HTTP_PORT=80
REM   node server.js

set PORT=3001
if not defined UE5_EXE (
  echo [WARN] UE5_EXE not set — controller will report simulated allocations.
  echo        Set it to your packaged UE5 build path to launch real streams.
)
node "%~dp0server.js"
