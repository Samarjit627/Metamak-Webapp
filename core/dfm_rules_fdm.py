from core.memory_types import DFMIssue
from typing import List

def dfm_rules_fdm() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Unsupported Overhang",
            description="Overhangs exceeding 45° without support may collapse or cause poor surface finish.",
            severity="medium",
            suggested_fix="Add support or redesign overhang to be ≤ 45°."
        ),
        DFMIssue(
            issue_type="Thin Wall",
            description="Walls below 0.8mm may not print properly or warp.",
            severity="high",
            suggested_fix="Increase wall thickness to ≥ 1mm."
        ),
        DFMIssue(
            issue_type="Large Flat Area",
            description="Large flat bottom surfaces may warp due to uneven cooling.",
            severity="low",
            suggested_fix="Add ribs or reduce area size."
        )
    ]
