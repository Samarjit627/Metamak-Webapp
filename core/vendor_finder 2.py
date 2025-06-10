from core.memory_store import get_part_memory
from core.memory_store import get_part_memory
from core.vendors_stub_db import get_all_vendors

def find_matching_vendors(part_id: str, **kwargs):
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    process = memory.selected_process.lower()
    material = memory.selected_material.lower()
    qty = memory.quantity or 1

    candidates = get_all_vendors()
    matches = []
    for vendor in candidates:
        vendor_processes = [p.lower() for p in vendor.get("processes", [])]
        vendor_materials = [m.lower() for m in vendor.get("materials", [])]
        min_qty = vendor.get("min_order_qty", 1)

        if process in vendor_processes and material in vendor_materials and qty >= min_qty:
            match_score = 100
            if vendor.get("tier", 1) > 1:
                match_score -= 10
            if qty > 1000 and vendor.get("min_order_qty", 1) > 100:
                match_score += 10

            matches.append({
                "vendor_id": vendor.get("vendor_id", ""),
                "name": vendor.get("name", ""),
                "city": vendor.get("city", ""),
                "tier": vendor.get("tier", 1),
                "contact": vendor.get("contact", ""),
                "match_score": match_score,
                "notes": f"Matched on process ({process}) and material ({material})"
            })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:3]
