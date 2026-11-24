$ErrorActionPreference = "Stop"
Write-Host "=== Running BillBook Automated Verification Suite ===" -ForegroundColor Cyan

Write-Host "`n[1/4] TypeScript Lint (tsc --noEmit)..." -ForegroundColor Green
npm run lint

Write-Host "`n[2/4] Node Unit, 50-Invoice GST, Anomaly Recall & Strict API Tests..." -ForegroundColor Green
npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts

Write-Host "`n[3/4] Vite Production Frontend Build..." -ForegroundColor Green
npm run build

Write-Host "`n[4/4] Spring Boot JUnit 5 + Integration Tests + JaCoCo >=80% Coverage Gate..." -ForegroundColor Green
Push-Location backend
try {
    mvn verify -B
} finally {
    Pop-Location
}

Write-Host "`nAll frontend & backend verification gates passed!" -ForegroundColor Cyan
