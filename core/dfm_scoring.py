from core.memory_types import DFMIssue
from typing import List

def calculate_manufacturability_score(issues: List[DFMIssue]) -> int:
    if not issues:
        return 100  # Perfect

    score = 100
    for issue in issues:
        if issue.severity == "high":
            score -= 20
        elif issue.severity == "medium":
            score -= 10
        elif issue.severity == "low":
            score -= 5

    return max(score, 0)
