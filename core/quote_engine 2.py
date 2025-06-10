from core.memory_store import get_part_memory
from core.cost_optimizer import simulate_cost
from core.vendor_finder import find_matching_vendors

def generate_quote(part_id: str):
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    cost_data = simulate_cost(part_id)
    vendors = find_matching_vendors(part_id)

    return {
        "part_id": part_id,
        "process": memory.selected_process,
        "material": memory.selected_material,
        "quantity": memory.quantity,
        "setup_cost": cost_data["setup_cost"],
        "unit_cost": cost_data["unit_cost"],
        "total_cost": cost_data["total_cost"],
        "lead_time_days": 7 if memory.quantity < 500 else 14,
        "vendor_recommendation": vendors[0] if vendors else None
    }
