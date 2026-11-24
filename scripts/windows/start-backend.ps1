$ErrorActionPreference = "Stop"
Write-Host "=== Starting BillBook Spring Boot Backend (Port 8080) ===" -ForegroundColor Cyan

if (-not $env:SPRING_DATASOURCE_URL) {
    $env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/billbook_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
}
if (-not $env:SPRING_DATASOURCE_USERNAME) {
    $env:SPRING_DATASOURCE_USERNAME = if ($env:MYSQL_USER) { $env:MYSQL_USER } else { "billbook_user" }
}
if (-not $env:SPRING_DATASOURCE_PASSWORD) {
    $env:SPRING_DATASOURCE_PASSWORD = if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { "changeme_local_only" }
}

Push-Location backend
try {
    mvn spring-boot:run
} finally {
    Pop-Location
}
