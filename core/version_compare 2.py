import json
from pathlib import Path

def load_version(part_id: str, version: str):
    path = Path(f"data/memory_versions/{part_id}_{version}.json")
    if not path.exists():
        return None
    return json.loads(path.read_text())

def compare_versions(part_id: str):
    v1 = load_version(part_id, "v1")
    v2 = load_version(part_id, "v2")
    if not v1 or not v2:
        return {"error": "One or both versions not found."}

    comparison = {
        "dfm_score_v1": v1.get("manufacturability_score", 0),
        "dfm_score_v2": v2.get("manufacturability_score", 0),
        "issues_v1": len(v1.get("dfm_issues", [])),
        "issues_v2": len(v2.get("dfm_issues", [])),
        "material_v1": v1.get("selected_material"),
        "material_v2": v2.get("selected_material"),
        "process_v1": v1.get("selected_process"),
        "process_v2": v2.get("selected_process"),
        "cost_per_part_v1": v1.get("cost_per_part", 0),
        "cost_per_part_v2": v2.get("cost_per_part", 0),
        "fixes_applied": list(set(v2.get("fixes", [])) - set(v1.get("fixes", [])))
    }

    return comparison
