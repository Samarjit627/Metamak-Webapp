import json
from pathlib import Path

def get_all_versions(part_id: str):
    base = Path("data/memory_versions")
    versions = []
    for vfile in base.glob(f"{part_id}_v*.json"):
        version = vfile.stem.split("_")[-1]
        data = json.loads(vfile.read_text())
        versions.append({
            "version": version,
            "dfm_score": data.get("manufacturability_score", 0),
            "cost_per_part": data.get("cost_per_part", 0),
            "material": data.get("selected_material"),
            "process": data.get("selected_process")
        })
    versions.sort(key=lambda x: x["version"])
    return versions
