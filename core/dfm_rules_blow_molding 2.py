from core.memory_types import DFMIssue
from typing import List

def dfm_rules_blow_molding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Uneven Wall Distribution",
            description="Blow molding may result in non-uniform walls if geometry is not symmetric or guided well.",
            severity="medium",
            suggested_fix="Ensure consistent wall thickness through part design or control features."
        ),
        DFMIssue(
            issue_type="Sharp Corners",
            description="Sharp transitions can weaken the plastic as it stretches unevenly.",
            severity="medium",
            suggested_fix="Use fillets ≥ 2mm in all corners."
        )
    ]
