# Windows 10/11 Setup & Execution Guide — Project P37 (`BillBook`)

This beginner-friendly guide walks you step by step through running **BillBook** on Windows using **PowerShell** — either natively (MySQL + Java Spring Boot + React) or in one command with **Docker Compose**.

---

## Option A — Fast Start with Docker Desktop (Recommended)

1. Install **Docker Desktop for Windows** (with WSL 2 enabled) and **Git**.
2. Open **PowerShell** inside the `P37-BillBook` project folder:
   ```powershell
   Copy-Item .env.example .env -Force
   .\scripts\windows\start-docker.ps1
   ```
   *(Or manually run `docker compose up --build`)*
3. Open your browser to `http://localhost:3000`.
4. In the left sidebar under **Runtime Mode**, click **Production** to connect to Spring Boot + MySQL 8!

---

## Option B — Native Windows Execution (No Docker)

### Step 1: Install Prerequisites
Open a new PowerShell window (or install via `winget`):
```powershell
winget install OpenJS.NodeJS.LTS
winget install EclipseAdoptium.Temurin.17.JDK
winget install Oracle.MySQL
```
Also install **Apache Maven 3.9+** (or extract Maven binary zip to `C:\tools\maven` and add `C:\tools\maven\bin` to System `PATH`), then reopen PowerShell and check versions:
```powershell
node -v
npm -v
java -version
mvn -version
mysql --version
```

### Step 2: Install Dependencies & Create `.env`
```powershell
.\scripts\windows\setup.ps1
```
*(Or manually run `Copy-Item .env.example .env` and `npm install`)*

### Step 3: Initialize MySQL 8 Database & Seed Data
Update your MySQL root password when prompted, or configure `MYSQL_USER` / `MYSQL_PASSWORD`:
```powershell
.\scripts\windows\start-db.ps1
```
If you prefer manual MySQL commands:
```powershell
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'billbook_user'@'localhost' IDENTIFIED BY 'changeme_local_only'; GRANT ALL PRIVILEGES ON billbook_db.* TO 'billbook_user'@'localhost'; FLUSH PRIVILEGES;"
Get-Content .\database\schema.sql -Raw | mysql -u root -p
Get-Content .\database\seed.sql -Raw | mysql -u root -p
```

### Step 4: Start the Spring Boot Backend (Terminal 1)
```powershell
.\scripts\windows\start-backend.ps1
```
Wait until you see `Started BillBookApplication`, then verify:
```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

### Step 5: Start the React Frontend (Terminal 2)
```powershell
.\scripts\windows\start-frontend.ps1
```
Open `http://localhost:3000`. Click **Production** in the sidebar to inspect live MySQL records, create invoices, record payments, and verify audit logs!

---

## Running All Automated Tests on Windows

```powershell
.\scripts\windows\run-tests.ps1
```
This runs:
1. TypeScript typecheck (`npm run lint`)
2. All 11 Node unit, dataset, and API tests (`npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts`)
3. Production frontend build (`npm run build`)
4. Spring Boot JUnit 5 + H2 integration tests + JaCoCo >=80% coverage verification (`cd backend; mvn verify`)

### Optional: Run Selenium E2E Tests (Requires Google Chrome)
With frontend running on `http://localhost:3000`:
```powershell
cd tests\selenium
mvn test
```

### Optional: Run SonarQube Analysis
Start SonarQube Server (`http://localhost:9000`), ensure `backend\mvn verify` ran first so `jacoco.xml` exists, then run:
```powershell
sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=YOUR_SONAR_TOKEN
```
