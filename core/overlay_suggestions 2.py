from core.memory_store import get_part_memory
from typing import List, Dict

def suggest_overlay_geometry(part_id: str) -> List[Dict]:
    memory = get_part_memory(part_id)
    if not memory:
        return []

    intent = memory.design_intent
    process = memory.selected_process or ""

    suggestions = []

    if process.lower() == "injection molding":
        suggestions.append({
            "feature": "draft_angle",
            "location": "vertical_walls",
            "value": "1.5°",
            "reason": "Required for easy mold release"
        })
        suggestions.append({
            "feature": "ribs",
            "location": "load-bearing zones",
            "value": "2mm thick",
            "reason": "Improves stiffness with less material"
        })
    if process.lower() == "cnc machining":
        suggestions.append({
            "feature": "fillet",
            "location": "internal corners",
            "value": "2mm radius",
            "reason": "Prevents stress concentration"
        })

    if intent and getattr(intent, 'load_condition', None) == "high load":
        suggestions.append({
            "feature": "boss",
            "location": "mounting holes",
            "value": "reinforced",
            "reason": "Supports high-stress points"
        })

    return suggestions
