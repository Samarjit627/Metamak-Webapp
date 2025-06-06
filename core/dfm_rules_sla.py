from core.memory_types import DFMIssue
from typing import List

def dfm_rules_sla() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Unsupported Thin Wall",
            description="Thin vertical walls without support may warp or fail in SLA printing.",
            severity="medium",
            suggested_fix="Add support or increase wall thickness."
        ),
        DFMIssue(
            issue_type="Hollow Without Drain Hole",
            description="Hollow parts must include drain holes to prevent resin pooling.",
            severity="high",
            suggested_fix="Add at least one 2mm+ drain hole in hollow areas."
        )
    ]
