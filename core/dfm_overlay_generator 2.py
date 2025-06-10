from core.memory_types import DFMIssue
from typing import List, Dict

from gpt_functions.fix_dfm_issue import suggest_fix_explanation

def generate_dfm_overlay(issues: List[DFMIssue]) -> List[Dict]:
    severity_color = {"high": "red", "medium": "yellow", "low": "green"}
    overlays = []

    for i, issue in enumerate(issues):
        overlays.append({
            "id": f"dfm_{i}",
            "geometryId": f"face_{i}",  # Placeholder — link to face ID later
            "type": "risk",
            "severity": issue.severity,
            "color": severity_color.get(issue.severity, "gray"),
            "tooltip": issue.description,
            "actions": ["Fix It", "Ignore", "Why?"]
        })

    # Optionally add ghost suggestions (fillets, ribs)
    overlays.append({
        "id": "ghost_draft_1",
        "geometryId": "face_17",
        "type": "ghost",
        "severity": "suggestion",
        "color": "blue",
        "tooltip": "Suggested 1.5° draft angle for vertical wall",
        "actions": ["Preview", "Apply", "Dismiss"],
        "fix_geometry": {
            "type": "draft_patch",
            "angle": 1.5,
            "direction": [0, 1, 0],
            "region": "face_17",
            "visual_model": "draft_patch.glb"
        }
    })

    return overlays
