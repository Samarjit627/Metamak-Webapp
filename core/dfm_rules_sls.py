from core.memory_types import DFMIssue
from typing import List

def dfm_rules_sls() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Thin Unsupported Feature",
            description="Features like pins or walls thinner than 1mm may break during powder removal.",
            severity="high",
            suggested_fix="Ensure minimum feature thickness is ≥ 1mm."
        ),
        DFMIssue(
            issue_type="Enclosed Hollow Without Escape Holes",
            description="Powder may get trapped inside hollow areas.",
            severity="medium",
            suggested_fix="Add powder escape holes ≥ 2mm."
        )
    ]
