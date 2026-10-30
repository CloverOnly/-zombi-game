@echo off
cd /d "%~dp0"
set "POYU_NODE="
where node.exe >nul 2>nul
if not errorlevel 1 set "POYU_NODE=node.exe"
if not defined POYU_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "POYU_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined POYU_NODE (
  echo Node.js 실행 파일을 찾지 못했습니다. 이 게임의 로컬 서버 실행에 Node.js가 필요합니다.
  pause
  exit /b 1
)
"%POYU_NODE%" "%~dp0play-local.cjs"
if errorlevel 1 pause
