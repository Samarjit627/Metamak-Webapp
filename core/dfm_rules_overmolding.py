from core.memory_types import DFMIssue
from typing import List

def dfm_rules_overmolding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Low Bond Surface Area",
            description="Small interface between materials may cause delamination.",
            severity="high",
            suggested_fix="Increase overlap or add mechanical interlocks."
        ),
        DFMIssue(
            issue_type="Undercuts on First Shot",
            description="Undercuts in base part can trap the second shot or complicate tooling.",
            severity="medium",
            suggested_fix="Avoid or simplify undercuts."
        )
    ]
