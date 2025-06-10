from core.memory_store import get_part_memory
from typing import Dict

def generate_handoff_guide(part_id: str) -> Dict:
    memory = get_part_memory(part_id)
    if not memory:
        return {"error": "Part not found"}

    process = memory.selected_process.lower() if memory.selected_process else ""
    material = memory.selected_material or "unspecified"
    qty = memory.quantity or 1

    # Default structure
    vendor_type = "general fabricator"
    file_types = ["STEP", "2D PDF"]
    checklist = ["Confirm tolerances", "Specify material grade", "Define surface finish"]

    if "injection" in process:
        vendor_type = "plastic injection molding vendor"
        file_types = ["STEP", "2D drawing", "Material spec sheet"]
        checklist += [
            "Confirm number of cavities",
            "Confirm shrinkage allowance"
        ]

    elif "cnc" in process:
        vendor_type = "CNC machining job shop"
        file_types = ["STEP", "PDF with tolerances"]
        checklist += [
            "Include thread callouts",
            "Indicate critical dimensions"
        ]

    elif "3d print" in process or "fdm" in process:
        vendor_type = "Rapid prototyping/3D print service"
        file_types = ["STL", "Slicer-ready G-code"]
        checklist = ["Confirm layer height", "Select print orientation"]

    elif "casting" in process:
        vendor_type = "metal casting foundry"
        file_types = ["STEP", "Drafted drawing"]
        checklist += ["Include draft angles", "Specify post-machining steps"]

    guide = {
        "vendor_type": vendor_type,
        "recommended_file_types": file_types,
        "key_checklist": checklist,
        "material": material,
        "process": memory.selected_process,
        "quantity": qty
    }

    return guide
