from core.memory_store import get_part_memory

def simulate_alternative_processes(part_id: str) -> str:
    memory = get_part_memory(part_id)
    if not memory:
        return "❌ Part memory not found."

    current_process = memory.selected_process
    current_material = memory.selected_material
    use_case = memory.design_intent.use_case if memory.design_intent else "general use"
    qty = memory.quantity or 1

    # Define alternative logic
    suggestions = []

    if "injection" in current_process.lower():
        suggestions.append({
            "process": "CNC Machining",
            "material": "Aluminum 6061",
            "reason": "Good for small batches and rigid prototypes"
        })
        if qty > 1000:
            suggestions.append({
                "process": "Multi-cavity Injection Molding",
                "material": current_material,
                "reason": "Faster cycle time and lower cost per part at scale"
            })

    elif "cnc" in current_process.lower():
        suggestions.append({
            "process": "3D Printing (FDM)",
            "material": "PLA",
            "reason": "Faster for prototypes, lower setup cost"
        })
        suggestions.append({
            "process": "Injection Molding",
            "material": "ABS",
            "reason": "Better for production runs of >500 parts"
        })

    elif "3d print" in current_process.lower():
        suggestions.append({
            "process": "CNC Machining",
            "material": "Delrin (POM)",
            "reason": "Higher durability and smoother finish for functional parts"
        })

    return f"""🔁 **What-If: Alternative Manufacturing Options** for use case: {use_case}\nCurrent Process: {current_process} | Material: {current_material} | Qty: {qty}\n\nSuggested Alternatives:\n""" + "\n".join([f"🔹 {s['process']} + {s['material']} → {s['reason']}" for s in suggestions])
