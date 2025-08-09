@echo off
echo ========================================
echo Starting Development Environment
echo ========================================

echo.
echo [1/4] Stopping processes on port 3006...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3006') do (
    echo Stopping process PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo [2/4] Stopping processes on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Stopping process PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo [3/4] Killing all Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js processes stopped successfully
) else (
    echo No Node.js processes were running
)

echo.
echo [4/4] Starting development servers...
echo Starting npm run dev:full...
npm run dev:full

echo.
echo ========================================
echo Development environment started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3006
echo ========================================

