# Module 4 — Activity 4.9: Benefits & Challenges of AI-Assisted Testing

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Evaluate benefits and limitations observed while applying AI to test case generation, dataset construction, Selenium scripting, and defect prediction in **BillBook**.

## 2. Key Takeaways

| Dimension | Benefits in BillBook | Challenges & Human Safeguards |
|---|---|---|
| **Test Data Variety** | Fast generation of 50 diverse GST combinations & 20 labeled anomalies | AI can miscompute expected totals if using mental math; solved by exact arithmetic generator + JUnit assertions |
| **UI & API Coverage** | Rapid creation of `BillBookIntegrationTest.java` and `BillBookSeleniumTest.java` | Brittle XPath selectors fail if UI wording changes; stabilized using `aria-label` attributes |
| **Financial Assertions** | Helped discover edge cases (`0%`, `28%`, `100.49` round-off) | Never rely on AI "looks right"—independently validate every rupee & paisa |

## 3. Expected Evidence
- Analysis documented in `ACTIVITY.md`.
