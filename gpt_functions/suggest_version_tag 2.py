from core.memory_store import get_part_memory

def suggest_version_tag(part_id: str) -> str:
    memory = get_part_memory(part_id)
    score = memory.get("manufacturability_score", 0)
    issues = memory.get("dfm_issues", [])
    qty = memory.get("quantity", 1)

    if score >= 90 and qty >= 1000:
        return "For Production"
    elif score >= 75 and qty < 500:
        return "Prototype"
    elif score < 70:
        return "Deprecated"
    else:
        return "Untitled"
