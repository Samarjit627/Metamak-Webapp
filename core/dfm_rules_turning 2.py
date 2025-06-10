from core.memory_types import DFMIssue
from typing import List

def dfm_rules_turning() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Deep Groove or Undercut",
            description="Deep grooves may require special tools or result in chatter.",
            severity="medium",
            suggested_fix="Reduce groove depth or use standard radii."
        ),
        DFMIssue(
            issue_type="Unchuckable Geometry",
            description="Part shape may not fit standard lathe chuck.",
            severity="high",
            suggested_fix="Redesign ends or provide gripping features."
        )
    ]
