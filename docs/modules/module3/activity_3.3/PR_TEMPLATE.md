# Pull Request Checklist — P37 BillBook

## Summary
- **Linked User Story**: `BB-XX`
- **Module / Layer**: `[Frontend React | Backend Spring Boot | MySQL Schema | Tests/Docs]`

## Verification Checklist
- [ ] `npm run lint` (`tsc --noEmit`) passes with 0 errors
- [ ] `npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts` passes 100%
- [ ] `cd backend && mvn verify` passes JUnit 5 tests and JaCoCo >=80% coverage gate
- [ ] No AI logic silently modifies unit prices, discounts, GST slabs, or invoice totals
- [ ] Production Mode does not silently fall back to synthetic `localStorage` mock data
- [ ] Zero secrets, database passwords, or API keys committed
