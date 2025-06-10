from core.memory_types import DFMIssue
from typing import List

def dfm_rules_casting() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Sharp Corner",
            description="Sharp internal corners can lead to hot spots or stress concentration in casting.",
            severity="high",
            suggested_fix="Use rounded fillets instead of sharp corners."
        ),
        DFMIssue(
            issue_type="Inconsistent Wall Thickness",
            description="Thick and thin wall transitions can cause uneven cooling and shrinkage defects.",
            severity="medium",
            suggested_fix="Maintain uniform wall thickness where possible."
        ),
        DFMIssue(
            issue_type="Complex Undercuts",
            description="Deep undercuts increase tooling complexity and cost.",
            severity="low",
            suggested_fix="Simplify geometry to avoid undercuts."
        )
    ]
