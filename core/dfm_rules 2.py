from core.memory_types import DFMIssue
from typing import List

def dfm_rules_cnc() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Sharp Internal Corner",
            description="Detected internal corner with 0° radius. CNC tools cannot cut sharp internal corners.",
            severity="medium",
            suggested_fix="Add fillet of at least 2mm radius."
        ),
        DFMIssue(
            issue_type="Thin Wall",
            description="Wall thickness below 1.0mm may cause chatter or breakage during machining.",
            severity="high",
            suggested_fix="Increase wall thickness to 1.5mm or more."
        )
    ]

def dfm_rules_injection_molding() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Missing Draft Angle",
            description="Vertical walls lack draft angle. This may cause part sticking in mold.",
            severity="high",
            suggested_fix="Add 1.5° draft to all vertical faces."
        ),
        DFMIssue(
            issue_type="Thick Section",
            description="Thick area >5mm can cause sink marks or warping.",
            severity="medium",
            suggested_fix="Reduce thickness or core out the section."
        )
    ]

def dfm_rules_sheet_metal() -> List[DFMIssue]:
    return [
        DFMIssue(
            issue_type="Tight Bend Radius",
            description="Bend radius less than material thickness can cause cracking.",
            severity="high",
            suggested_fix="Ensure bend radius ≥ material thickness."
        ),
        DFMIssue(
            issue_type="No Relief Cut",
            description="Missing relief near corner bend may cause tearing.",
            severity="medium",
            suggested_fix="Add relief cut or notch near bend region."
        )
    ]
