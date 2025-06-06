from core.memory_store import get_part_memory
from core.cost_optimizer import simulate_cost
from core.dfm_engine import run_dfm_check
from core.vendor_finder import find_matching_vendors

def simulate_whatif(part_id: str, new_process: str, new_material: str, qty: int = None):
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    # Temporarily override memory
    memory.selected_process = new_process
    memory.selected_material = new_material
    if qty:
        memory.quantity = qty

    dfm = run_dfm_check(part_id)
    cost = simulate_cost(part_id)
    vendors = find_matching_vendors(part_id)

    return {
        "scenario": f"{new_process} + {new_material}",
        "dfm_score": dfm.manufacturability_score,
        "cost_per_part": cost["cost_per_part"],
        "vendors": vendors
    }
