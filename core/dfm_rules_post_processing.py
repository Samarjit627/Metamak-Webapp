from core.memory_types import DFMIssue
from typing import List

def dfm_rules_post_processing() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Polishing Difficult Area",
            description="Tight or internal geometries are hard to polish or deburr.",
            severity="low",
            suggested_fix="Simplify or open geometry for accessibility."
        ),
        DFMIssue(
            issue_type="Sharp Edge",
            description="Sharp external edges increase post-processing time and safety risk.",
            severity="medium",
            suggested_fix="Use 0.5–1mm chamfer or fillet."
        )
    ]
