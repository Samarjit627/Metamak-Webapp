from core.memory_types import DFMIssue
from typing import List

def dfm_rules_insert_molding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Floating Insert",
            description="Insert not properly located can shift during molding.",
            severity="high",
            suggested_fix="Add locating features like ribs, slots, or flat surfaces."
        ),
        DFMIssue(
            issue_type="Thermal Mismatch",
            description="Insert material and plastic have different thermal expansion, which may cause stress.",
            severity="medium",
            suggested_fix="Use compatible materials or adjust geometry to compensate."
        )
    ]
