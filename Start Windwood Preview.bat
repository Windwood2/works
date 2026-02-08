@echo off
cd /d "%~dp0"

REM Always open the site + GitHub Desktop
start "" http://localhost:8000/
start "" "%LOCALAPPDATA%\GitHubDesktop\GitHubDesktop.exe"
start "" "C:\Program Files\Notepad++\notepad++.exe" -multiInst

REM Start the server ONLY if port 8000 is not already in use
netstat -ano | findstr ":8000 " >nul
if errorlevel 1 (
  start "Windwood Server" py -m http.server 8000
) else (
  echo Server already running on port 8000.
)

pause

