@echo off
echo Building and exporting AI-Travel-Planner Docker image...

:: Check Docker installation
docker --version >nul 2>nul
if errorlevel 1 (
    echo Error: Docker not found. Please install Docker Desktop and start it.
    pause
    exit /b 1
)

:: Try to configure Docker to use reliable registry mirrors
echo Configuring Docker to use reliable registry mirrors...
:: First, let's try to pull the base image with explicit registry specification

:: Check if Docker is running
docker info >nul 2>nul
if errorlevel 1 (
    echo Error: Docker service is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

:: Set environment variables to bypass mirror issues
set DOCKER_BUILDKIT=0
echo Setting Docker to use official registry...

:: Set image details
set IMAGE_NAME=ai-travel-planner
set IMAGE_TAG=latest
set TAR_FILE=output\%IMAGE_NAME%_%IMAGE_TAG%.tar

:: Create output directory
mkdir output >nul 2>nul

:: Try to pull the base image with explicit registry URL
echo Attempting to pull base image using explicit registry URL...
docker pull registry-1.docker.io/library/node:20-slim

if errorlevel 1 (
    echo Failed to pull with explicit registry. Trying with Docker Hub mirror...
    :: Try with Docker Hub official mirror
    docker pull --registry-mirror=https://registry-1.docker.io node:20-slim
    
    if errorlevel 1 (
        echo Failed with Docker Hub mirror. Trying with Alibaba Cloud mirror...
        :: Try with Alibaba Cloud mirror which is usually more stable in China
        docker pull --registry-mirror=https://registry.cn-hangzhou.aliyuncs.com node:20-slim
    )
)

:: Now try to build the image with explicit registry and no cache
set DOCKER_BUILDKIT=0
echo Building Docker image with explicit registry and no cache...
docker build --no-cache -t %IMAGE_NAME%:%IMAGE_TAG% .

if errorlevel 1 (
    echo Error: Build failed. Trying with explicit registry in build command...
    docker build --no-cache --pull --build-arg BASE_IMAGE=registry-1.docker.io/library/node:20-slim -t %IMAGE_NAME%:%IMAGE_TAG% .
)

:: Check if build succeeded
if errorlevel 1 (
    echo Error: Failed to build Docker image.
    echo Trying final method with no cache and direct registry...
    docker build --no-cache --pull -t %IMAGE_NAME%:%IMAGE_TAG% .
    if errorlevel 1 (
        echo Error: Failed to build Docker image despite all attempts.
        echo Please check your network connection and Docker configuration.
        pause
        exit /b 1
    )
)

:: Export Docker image
echo Exporting Docker image to %TAR_FILE%...
docker save -o %TAR_FILE% %IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo Error: Failed to export Docker image.
    pause
    exit /b 1
)

echo Success! Docker image has been built and exported to %TAR_FILE%
echo.
echo Usage instructions:
echo 1. Load image: docker load -i %TAR_FILE%
echo 2. Run container: docker run -d -p 3000:3000 --name ai-travel-planner %IMAGE_NAME%:%IMAGE_TAG%
echo 3. Access application: http://localhost:3000

echo.
echo Press any key to exit...
pause >nul