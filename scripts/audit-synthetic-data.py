
import pandas as pd
import numpy as np
import os

def ascii_histogram(data, bins=10, width=50):
    counts, bin_edges = np.histogram(data, bins=bins)
    max_count = counts.max()
    if max_count == 0: return "No data"

    result = []
    for i in range(len(counts)):
        bar_len = int(counts[i] / max_count * width)
        bar = '#' * bar_len
        range_str = f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}"
        result.append(f"{range_str.ljust(15)} | {bar} ({counts[i]})")
    return "\n".join(result)

def analyze_data(filepath):
    print(f"Analyzing {filepath}...")
    df = pd.read_csv(filepath)

    report = f"# Data Realism Audit Report\n\n"
    report += f"**Date:** {pd.Timestamp.now()}\n"
    report += f"**Dataset:** `{filepath}`\n"
    report += f"**Samples:** {len(df)}\n\n"

    # 1. Class Balance
    mastery_counts = df['mastered'].value_counts(normalize=True)
    report += "## 1. Class Balance\n"
    report += "| Class | Count | Percentage |\n|---|---|---|\n"
    for cls, count in df['mastered'].value_counts().items():
        report += f"| {cls} | {count} | {mastery_counts[cls]*100:.1f}% |\n"

    if mastery_counts.min() < 0.1:
        report += "\n**⚠️ Warning:** Severe class imbalance detected. Minority class < 10%.\n"

    # 2. Feature Distributions
    report += "\n## 2. Feature Distributions\n"

    features = ['avg_quiz_score', 'attempts_per_topic', 'time_spent_per_question', 'days_since_last_revision']

    for feat in features:
        report += f"\n### {feat}\n"
        report += f"- Mean: {df[feat].mean():.2f}\n"
        report += f"- Std: {df[feat].std():.2f}\n"
        report += f"- Min: {df[feat].min():.2f}\n"
        report += f"- Max: {df[feat].max():.2f}\n"
        report += "\n```\n"
        report += ascii_histogram(df[feat])
        report += "\n```\n"

    # 3. Correlation Analysis
    report += "\n## 3. Correlation Analysis\n"
    corr = df.corr()['mastered'].sort_values(ascending=False)
    report += "Correlation with Target (mastered):\n"
    report += "| Feature | Correlation |\n|---|---|\n"
    for feat, val in corr.items():
        if feat != 'mastered':
            report += f"| {feat} | {val:.3f} |\n"

    # 4. Realism Checks
    report += "\n## 4. Realism Findings\n"
    findings = []

    # Check 1: Score vs Mastery
    high_score_failures = df[(df['avg_quiz_score'] > 0.9) & (df['mastered'] == 0)]
    if len(high_score_failures) > 0:
        findings.append(f"Found {len(high_score_failures)} students with >90% score who are NOT mastered. This might indicate strict logic override.")

    # Check 2: Time spent realism
    fast_attempts = df[df['time_spent_per_question'] < 5]
    if len(fast_attempts) > 0:
        findings.append(f"Found {len(fast_attempts)} attempts under 5 seconds. Unrealistic for genuine attempts.")

    # Check 3: Imbalance
    if mastery_counts.get(1, 0) < 0.2:
        findings.append("Mastery rate is very low (< 20%). Is the threshold too high?")

    if not findings:
        report += "✅ No obvious realism violations found.\n"
    else:
        for f in findings:
            report += f"- ⚠️ {f}\n"

    # 5. Recommendations
    report += "\n## 5. Recommendations\n"
    report += "1. **Adjust Class Balance:** The dataset is highly imbalanced. Consider oversampling the minority class or adjusting the generation logic to produce more 'mastered' examples.\n"
    report += "2. **Review Logic Overrides:** The strict logic in `generate_data.py` (e.g., `if avg_quiz_score < 0.5: mastery_prob = 0`) creates sharp cutoffs that might not reflect real-world nuance.\n"
    report += "3. **Expand Feature Set:** Consider adding 'consistency_score' or 'topic_difficulty' for more robust modeling.\n"

    # Save Report
    if not os.path.exists('reports'):
        os.makedirs('reports')

    with open('reports/DATA_REALISM_REPORT.md', 'w') as f:
        f.write(report)

    print(f"Report saved to reports/DATA_REALISM_REPORT.md")

if __name__ == "__main__":
    analyze_data("training_data.csv")
