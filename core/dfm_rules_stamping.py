from core.memory_types import DFMIssue
from typing import List

def dfm_rules_stamping() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Sharp Internal Corners",
            description="Sharp internal corners increase tool wear and may cause cracking in stamped parts.",
            severity="medium",
            suggested_fix="Add fillets ≥ 1mm to internal corners."
        ),
        DFMIssue(
            issue_type="No Relief Near Bends",
            description="Missing relief notches near bends can lead to tearing or distortion.",
            severity="high",
            suggested_fix="Add corner reliefs near all critical bends."
        )
    ]
