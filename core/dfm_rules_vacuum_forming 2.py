from core.memory_types import DFMIssue
from typing import List

def dfm_rules_vacuum_forming() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Insufficient Draft Angle",
            description="Vertical walls need a minimum draft of 4–6° for easy mold release.",
            severity="high",
            suggested_fix="Add at least 5° draft on all vertical surfaces."
        ),
        DFMIssue(
            issue_type="Sharp Internal Corners",
            description="Sharp corners prevent proper sheet stretch and cause tearing.",
            severity="medium",
            suggested_fix="Use fillets of at least 2mm on all inner corners."
        )
    ]
