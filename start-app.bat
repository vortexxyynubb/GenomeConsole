@echo off
REM Starts the DNA Analyzer backend + frontend, then opens the app in your browser.
REM Place this file in the SAME folder that contains "backend" and "frontend".

echo Starting backend (FastAPI)...
start "DNA Analyzer - Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"

echo Starting frontend (React)...
start "DNA Analyzer - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting a few seconds for the servers to boot up...
timeout /t 6 /nobreak >nul

echo Opening the app in your browser...
start http://localhost:5173

echo.
echo Two new windows opened - one for the backend, one for the frontend.
echo Leave both open while you use the app. Close this window whenever you like.
pause
