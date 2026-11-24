"""Interpretable Software Defect Risk Predictor for Project P37 — BillBook."""
import csv
from pathlib import Path


def score_module(row: dict[str, str]) -> tuple[float, str]:
    loc = int(row["loc"])
    cc = int(row["cyclomatic_complexity"])
    fan_out = int(row["fan_out"])
    churn = int(row["churn_commits"])
    cov = float(row["coverage_pct"])

    # Interpretable weighted linear risk index (0..100)
    score = (
        min(25.0, loc / 25.0)
        + min(30.0, cc * 1.25)
        + min(20.0, fan_out * 2.2)
        + min(15.0, churn * 1.5)
        + max(0.0, (95.0 - cov) * 0.6)
    )
    risk = "HIGH" if score >= 55 else "MEDIUM" if score >= 38 else "LOW"
    return round(score, 2), risk


def main() -> None:
    csv_path = Path(__file__).with_name("defect_metrics.csv")
    results = []
    with csv_path.open("r", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            score, risk = score_module(row)
            results.append((score, risk, row["module_name"], row["coverage_pct"], row["observed_pre_release_defects"]))

    results.sort(reverse=True)
    print(f"{'Module':<38} {'RiskScore':>9} {'Band':>8} {'Cov%':>6} {'Defects':>7}")
    print("-" * 74)
    for score, risk, name, cov, defects in results:
        print(f"{name:<38} {score:>9.2f} {risk:>8} {cov:>6} {defects:>7}")


if __name__ == "__main__":
    main()
