from core.memory_types import DFMIssue
from typing import List

def dfm_rules_compression_molding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Inconsistent Thickness",
            description="Varying wall thickness causes uneven curing and weak spots in molded rubber.",
            severity="high",
            suggested_fix="Keep thickness uniform throughout mold cavity."
        ),
        DFMIssue(
            issue_type="Missing Air Escape",
            description="Lack of vent paths traps air and creates voids.",
            severity="medium",
            suggested_fix="Add vent features or split parting lines."
        )
    ]
