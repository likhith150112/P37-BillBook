$ErrorActionPreference = "Stop"
Write-Host "=== BillBook (P37) Windows Environment Setup ===" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example (edit local DB password before production use)." -ForegroundColor Yellow
}

Write-Host "Installing npm dependencies..." -ForegroundColor Green
npm install

Write-Host "Checking Maven dependencies offline cache..." -ForegroundColor Green
Push-Location backend
mvn dependency:go-offline -B
Pop-Location

Write-Host "Setup complete! Next run .\scripts\windows\start-db.ps1" -ForegroundColor Cyan
