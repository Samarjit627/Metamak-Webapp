from core.memory_types import DFMIssue
from typing import List

def dfm_rules_wood_turning() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Too Thin Geometry",
            description="Thin wooden features may crack under turning forces.",
            severity="high",
            suggested_fix="Ensure minimum diameter ≥ 10mm for unsupported sections."
        ),
        DFMIssue(
            issue_type="Sharp Transitions",
            description="Sudden changes in diameter weaken structural integrity during rotation.",
            severity="medium",
            suggested_fix="Use smooth tapers instead of steps."
        )
    ]
