from core.memory_types import DFMIssue
from typing import List

def dfm_rules_die_casting() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Thick Section",
            description="Thick areas in die casting can lead to shrinkage porosity.",
            severity="high",
            suggested_fix="Core out or maintain uniform thickness throughout."
        ),
        DFMIssue(
            issue_type="No Draft Angle",
            description="Die cast parts require draft to avoid sticking in die.",
            severity="high",
            suggested_fix="Add 1–3° draft on all external walls."
        )
    ]
