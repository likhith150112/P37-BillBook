$ErrorActionPreference = "Stop"
Write-Host "=== Starting BillBook React Frontend (Port 3000) ===" -ForegroundColor Cyan

if (-not $env:VITE_API_BASE_URL) {
    $env:VITE_API_BASE_URL = "http://localhost:8080/api"
}

npm run dev
