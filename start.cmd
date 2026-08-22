@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Start fehlgeschlagen -^> Node.js fehlt. Naechster Schritt: Node.js 20 LTS oder neuer installieren.
  pause
  exit /b 1
)
node scripts\start.mjs %*
if errorlevel 1 pause
