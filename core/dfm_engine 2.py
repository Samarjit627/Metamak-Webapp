from core.memory_store import get_part_memory, save_part_memory
from core.dfm_router import get_dfm_rules
from core.dfm_scoring import calculate_manufacturability_score
from core.memory_types import PartMemory, DFMIssue
from core.material_recommender import load_materials


def get_material_thresholds(material_name: str):
    materials = load_materials()
    for mat in materials:
        if mat["name"].lower() == material_name.lower():
            return {
                "min_wall_thickness_mm": mat.get("min_wall_thickness_mm", 1.0),
                "min_draft_angle_deg": mat.get("min_draft_angle_deg", 0.5)
            }
    return {
        "min_wall_thickness_mm": 1.0,
        "min_draft_angle_deg": 0.5
    }

def run_dfm_check(part_id: str) -> PartMemory:
    memory = get_part_memory(part_id)
    if not memory:
        raise ValueError("Part memory not found")

    material = memory.selected_material or ""
    process = memory.selected_process or ""

    issues = get_dfm_rules(material, process)

    # --- Material-aware DFM rules ---
    thresholds = get_material_thresholds(material)

    # Dummy checks for demonstration; replace with CAD-driven checks in future
    if thresholds["min_wall_thickness_mm"] > 1.2:
        issues.append(DFMIssue(
            issue_id="wall-too-thin-material",
            description=f"Selected material ({material}) requires minimum wall thickness of {thresholds['min_wall_thickness_mm']} mm.",
            severity="high",
            notes=f"Increase wall thickness to ≥ {thresholds['min_wall_thickness_mm']} mm."
        ))
    if thresholds["min_draft_angle_deg"] > 1.5:
        issues.append(DFMIssue(
            issue_id="insufficient-draft-material",
            description=f"{material} typically needs {thresholds['min_draft_angle_deg']}° draft for ejection.",
            severity="medium",
            notes=f"Add or increase draft angle to at least {thresholds['min_draft_angle_deg']}°."
        ))

    memory.dfm_issues = issues
    memory.manufacturability_score = calculate_manufacturability_score(issues)
    save_part_memory(memory)
    return memory
