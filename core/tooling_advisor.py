from core.memory_store import get_part_memory
from typing import Dict


def tooling_advice(part_id: str) -> Dict:
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    process = (
        memory.selected_process.lower() if memory.selected_process else ""
    )
    qty = memory.quantity or 1

    # Sample logic — expand this with real-world cases
    if "injection" in process:
        tool_type = (
            "2-plate mold" if qty <= 5000 else "multi-cavity hardened mold"
        )
        complexity = "medium" if qty <= 5000 else "high"
        notes = (
            "Consider side-action cores for undercuts"
            if qty > 1000 else "Simple ejector system likely sufficient"
        )
        cost_level = "₹₹₹₹" if qty > 5000 else "₹₹₹"

    elif "die cast" in process:
        tool_type = "multi-cavity steel die"
        complexity = "high"
        notes = "Use thermal control and draft for ejection"
        cost_level = "₹₹₹₹₹"

    elif "fdm" in process or "3d print" in process:
        tool_type = "no tooling"
        complexity = "very low"
        notes = "Print-ready — optimize orientation in slicer"
        cost_level = "₹"

    else:
        tool_type = "tooling info unavailable"
        complexity = "unknown"
        notes = "Tooling guidance not available for this process"
        cost_level = "?"

    return {
        "tool_type": tool_type,
        "complexity_level": complexity,
        "cost_estimate": cost_level,
        "recommendations": notes
    }
