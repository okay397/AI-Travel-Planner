@echo off

REM Simple Docker Image Builder

set IMAGE_NAME=ai-travel-planner
set IMAGE_TAG=latest
set TAR_FILE=%IMAGE_NAME%-%IMAGE_TAG%.tar

echo ================
echo BUILDING DOCKER IMAGE
===============

REM Try to run docker --version to verify installation
docker --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot run docker command.
    echo Please make sure Docker Desktop is installed and running.
    pause
    exit /b 1
)

echo Docker is available. Checking version...
docker --version

echo. 
echo Building Docker image...
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker image.
    pause
    exit /b 1
)

echo.
echo Building successful. Exporting image...
docker save -o %TAR_FILE% %IMAGE_NAME%:%IMAGE_TAG%
if %errorlevel% neq 0 (
    echo ERROR: Failed to export Docker image.
    pause
    exit /b 1
)

echo ================
echo SUCCESS!
echo Docker image file created: %TAR_FILE%
echo Location: %cd%
echo ================
echo Instructions:
echo 1. Copy %TAR_FILE% to target machine
echo 2. Load image: docker load -i %TAR_FILE%
echo 3. Run container: docker run -d -p 3000:3000 %IMAGE_NAME%:%IMAGE_TAG%
echo 4. Access: http://localhost:3000
echo ================

pause