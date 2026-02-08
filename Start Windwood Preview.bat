@echo off
cd /d "%~dp0"

REM Check if port 8000 is already in use
netstat -ano | findstr ":8000 " >nul
if errorlevel 1 (
  echo Starting Python server on port 8000...
  start "Windwood Server" py -m http.server 8000
  timeout /t 2 >nul
) else (
  echo Server already running on port 8000.
)

REM Open site + tools AFTER server is ready
start "" http://localhost:8000/
start "" "%LOCALAPPDATA%\GitHubDesktop\GitHubDesktop.exe"
start "" "C:\Program Files\Notepad++\notepad++.exe" -multiInst

pause

