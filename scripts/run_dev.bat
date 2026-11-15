@echo off
echo =====================================================================
echo Starting NILAM PESUM (நிலம் பேசும்) Full-Stack Development Servers
echo NASA-Powered AI Agricultural Intelligence Platform
echo =====================================================================

REM Ensure database is initialized
cd /d %~dp0\..\backend
echo Initializing database and reference datasets...
python -c "from app.database.init_db import init_database; init_database()"

REM Start backend server in new window
echo Starting FastAPI Backend API Server on http://127.0.0.1:8000...
start "NILAM PESUM - FastAPI Backend" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM Start frontend server
cd /d %~dp0\..\frontend
echo Starting React Vite Frontend Server on http://localhost:3000...
start "NILAM PESUM - React Frontend" cmd /k "npm run dev"

echo.
echo =====================================================================
echo Both servers are launching:
echo   - Frontend: http://localhost:3000
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo =====================================================================

