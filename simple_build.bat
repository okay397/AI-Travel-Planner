@echo off
echo Simple Docker build script for AI-Travel-Planner

:: Set variables
set IMAGE_NAME=ai-travel-planner
set IMAGE_TAG=latest
set OUTPUT_DIR=output
set TAR_FILE=%OUTPUT_DIR%\%IMAGE_NAME%_%IMAGE_TAG%.tar

:: Create output directory
mkdir %OUTPUT_DIR% 2>nul

:: Disable buildkit to avoid mirror issues
set DOCKER_BUILDKIT=0

:: Directly build with explicit registry in Dockerfile
echo Building Docker image with explicit registry URL...
docker build --build-arg BASE_IMAGE=registry-1.docker.io/library/node:20-slim -t %IMAGE_NAME%:%IMAGE_TAG% .

if errorlevel 1 (
    echo Error: Build failed. Trying with Alibaba Cloud registry...
    docker build --build-arg BASE_IMAGE=registry.cn-hangzhou.aliyuncs.com/library/node:20-slim -t %IMAGE_NAME%:%IMAGE_TAG% .
    
    if errorlevel 1 (
        echo Error: Build failed with all attempts.
        pause
        exit /b 1
    )
)

echo Build successful! Now exporting image...
docker save -o %TAR_FILE% %IMAGE_NAME%:%IMAGE_TAG%

if errorlevel 1 (
    echo Error: Failed to export image.
    pause
    exit /b 1
)

echo Success! Docker image exported to %TAR_FILE%
echo.
echo To load the image: docker load -i %TAR_FILE%
echo To run the container: docker run -d -p 3000:3000 %IMAGE_NAME%:%IMAGE_TAG%

pause