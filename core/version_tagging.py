import json
from pathlib import Path

def tag_version(part_id: str, version: str, tag: str):
    path = Path(f"data/memory_versions/{part_id}_{version}.json")
    if not path.exists():
        return {"error": "Version not found"}

    data = json.loads(path.read_text())
    data["version_tag"] = tag
    path.write_text(json.dumps(data, indent=2))
    return {"status": "ok", "tag": tag}

def get_version_tag(part_id: str, version: str):
    path = Path(f"data/memory_versions/{part_id}_{version}.json")
    if not path.exists():
        return None
    data = json.loads(path.read_text())
    return data.get("version_tag", "Untitled")
