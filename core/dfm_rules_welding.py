from core.memory_types import DFMIssue
from typing import List

def dfm_rules_welding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Gap Too Wide",
            description="Weld gap >1mm can cause weak joints or filler issues.",
            severity="high",
            suggested_fix="Ensure mating parts have consistent, tight-fitting edges."
        ),
        DFMIssue(
            issue_type="Inaccessible Weld Zone",
            description="Some weld joints are located in hard-to-reach areas.",
            severity="medium",
            suggested_fix="Reorient parts or simplify geometry for welder access."
        )
    ]
