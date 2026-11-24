# Module 3 — Activity 3.5: Jenkins Pipeline

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`/Jenkinsfile` configured) | `PENDING` (Local Jenkins Blue Ocean / Stage View build console screenshot)

## 1. Objective
Define a declarative `Jenkinsfile` executing frontend checks, TypeScript unit tests, Vite production build, and Spring Boot Maven verification + JaCoCo archival.

## 2. Pipeline Stages (`/Jenkinsfile`)
1. **Frontend Checks & Build**: `npm ci`, `npm run lint`, `npx --yes tsx --test ...`, `npm run build`.
2. **Backend Spring Boot & JaCoCo Verify**: `dir('backend') { sh 'mvn verify -B' }`.
3. **Post Always**: `archiveArtifacts artifacts: 'backend/target/site/jacoco/**/*'`.

## 3. Expected Evidence
- Declarative pipeline at `/Jenkinsfile`.
- Local Jenkins stage view screenshot (**PENDING** local Jenkins server execution).
