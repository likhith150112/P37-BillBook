param(
    [string]$MysqlRootUser = "root"
)
$ErrorActionPreference = "Stop"

Write-Host "=== Initializing BillBook MySQL 8 Schema & Synthetic Seed Data ===" -ForegroundColor Cyan
$rootPass = Read-Host -Prompt "Enter MySQL '$MysqlRootUser' password" -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPass)
)

$dbUser = if ($env:MYSQL_USER) { $env:MYSQL_USER } else { "billbook_user" }
$dbPass = if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { "changeme_local_only" }

$grantSql = @"
CREATE DATABASE IF NOT EXISTS billbook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$dbUser'@'localhost' IDENTIFIED BY '$dbPass';
GRANT ALL PRIVILEGES ON billbook_db.* TO '$dbUser'@'localhost';
FLUSH PRIVILEGES;
"@

$grantSql | mysql "-u$MysqlRootUser" "-p$plainPass"
Get-Content ".\database\schema.sql" -Raw | mysql "-u$MysqlRootUser" "-p$plainPass"
Get-Content ".\database\seed.sql" -Raw | mysql "-u$MysqlRootUser" "-p$plainPass"

Write-Host "Database billbook_db initialized and seeded cleanly!" -ForegroundColor Green
