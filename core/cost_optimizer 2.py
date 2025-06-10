from core.memory_store import get_part_memory
from typing import Dict

def simulate_cost(part_id: str) -> Dict:
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    process = memory.selected_process.lower()
    material = memory.selected_material.lower()
    qty = memory.quantity or 1

    base_rate = 100  # Dummy base cost/unit
    setup_cost = 0

    # Process multipliers (later driven by real data)
    if "injection" in process:
        setup_cost = 20000
        cost_per_unit = 5
    elif "cnc" in process:
        setup_cost = 500
        cost_per_unit = 40
    elif "3d print" in process or "fdm" in process:
        setup_cost = 0
        cost_per_unit = 100
    else:
        setup_cost = 1000
        cost_per_unit = 20

    total_cost = setup_cost + (cost_per_unit * qty)
    cost_per_part = round(total_cost / qty, 2) if qty else 0

    return {
        "setup_cost": setup_cost,
        "unit_cost": cost_per_unit,
        "total_cost": total_cost,
        "cost_per_part": cost_per_part,
        "note": f"Simulated cost for {process} with {material} at qty {qty}"
    }

def simulate_cost_curve(part_id: str):
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    process = memory.selected_process.lower()
    material = memory.selected_material.lower()
    # Use same logic as simulate_cost for setup/unit cost
    if "injection" in process:
        setup_cost = 20000
        unit_cost = 5
    elif "cnc" in process:
        setup_cost = 500
        unit_cost = 40
    elif "3d print" in process or "fdm" in process:
        setup_cost = 0
        unit_cost = 100
    else:
        setup_cost = 1000
        unit_cost = 20

    quantities = [1, 10, 100, 500, 1000, 5000, 10000]
    curve = []
    for qty in quantities:
        total = setup_cost + (unit_cost * qty)
        per_part = round(total / qty, 2)
        curve.append({"qty": qty, "cost_per_part": per_part})
    return curve
