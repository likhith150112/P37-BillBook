$ErrorActionPreference = "Stop"
Write-Host "=== Starting BillBook Full Stack via Docker Compose ===" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created default .env from .env.example." -ForegroundColor Yellow
}

docker compose up --build
