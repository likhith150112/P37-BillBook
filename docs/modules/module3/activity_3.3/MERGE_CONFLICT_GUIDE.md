# Planned Merge Conflict Resolution Walkthrough (Module 3.3)

## Scenario
Two concurrent branches modify `backend/src/main/java/com/billbook/service/AutoCategorisationService.java` on the HSN `8471` keyword rule:
- `feature/hsn-laptops` adds `"ultrabook", "chromebook"` to `IT Hardware & Computing`.
- `feature/hsn-accessories` adds `"docking station", "webcam"` to the same line.

## Safe PowerShell / Git Commands to Practice & Capture Evidence
```powershell
git checkout -b feature/hsn-laptops main
# edit HSN 8471 keywords and commit
git checkout -b feature/hsn-accessories main
# edit same line in AutoCategorisationService.java and commit
git checkout main
git merge feature/hsn-laptops
git merge feature/hsn-accessories   # triggers conflict markers <<<<<<< / ======= / >>>>>>>
# Keep BOTH keyword sets cleanly, then verify:
cd backend
mvn test
cd ..
git add backend/src/main/java/com/billbook/service/AutoCategorisationService.java
git commit -m "chore: resolve HSN 8471 keyword merge conflict preserving both branches"
```
