from core.memory_types import DFMIssue
from typing import List

def dfm_rules_thermoforming() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Insufficient Draft Angle",
            description="Thermoformed parts need draft to be ejected cleanly from mold.",
            severity="high",
            suggested_fix="Add draft angle of ≥ 3° to all vertical faces."
        ),
        DFMIssue(
            issue_type="Deep Draw Ratio Exceeded",
            description="Draw depth more than 2–3x the width may cause thinning or tearing.",
            severity="high",
            suggested_fix="Reduce draw depth or use stepped features."
        )
    ]
