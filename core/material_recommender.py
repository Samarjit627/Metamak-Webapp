import json
from pathlib import Path
from core.memory_store import get_part_memory
from typing import List, Dict

LIBRARY_PATH = Path("data/material_library.json")

def load_materials() -> List[Dict]:
    with open(LIBRARY_PATH, "r") as f:
        return json.load(f)

def recommend_materials(part_id: str) -> List[Dict]:
    memory = get_part_memory(part_id)
    if not memory or not memory.design_intent:
        return [{"error": "Part or design intent not found"}]

    intent = memory.design_intent
    process = memory.selected_process.lower()

    matches = []
    for mat in load_materials():
        if process in [p.lower() for p in mat["processes"]]:
            if intent.use_case.lower() in " ".join(mat["suitable_for"]).lower():
                matches.append(mat)

    return matches[:3] if matches else [{"message": "No strong material matches found"}]
