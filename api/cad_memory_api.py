from fastapi import APIRouter, HTTPException
from datetime import datetime
from core.memory_store import (
    get_part_memory,
    save_part_memory,
    log_action
)
from core.memory_types import PartMemory, MemoryLogEntry
from core.dfm_engine import run_dfm_check
from core.dfm_overlay_generator import generate_dfm_overlay
from core.tooling_advisor import tooling_advice
from core.handoff_guide import generate_handoff_guide
from core.cost_optimizer import simulate_cost

router = APIRouter()

@router.get("/memory/{part_id}", response_model=PartMemory)
def fetch_memory(part_id: str):
    memory = get_part_memory(part_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Part memory not found")
    return memory

@router.get("/memory/{part_id}/summary")
def summarize_memory(part_id: str):
    memory = get_part_memory(part_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {
        "design_intent": memory.design_intent.dict() if memory.design_intent else None,
        "dfm_issues": [i.dict() for i in memory.dfm_issues],
        "material": memory.selected_material,
        "process": memory.selected_process,
        "quantity": memory.quantity,
        "last_updated": memory.uploaded_at
    }

@router.post("/memory/{part_id}")
def save_memory(part_id: str, memory: PartMemory):
    save_part_memory(memory)
    return {"status": "success", "message": f"Memory saved for part {part_id}"}

@router.patch("/memory/{part_id}/log")
def add_log(part_id: str, log: MemoryLogEntry):
    memory = get_part_memory(part_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Part memory not found")
    updated = log_action(memory, log.action, log.detail)
    save_part_memory(updated)
    return {"status": "success", "message": "Log entry added"}

@router.post("/memory/{part_id}/dfm-check")
def trigger_dfm_analysis(part_id: str):
    updated = run_dfm_check(part_id)
    return {"status": "success", "dfm_issues": [i.dict() for i in updated.dfm_issues]}

@router.get("/memory/{part_id}/dfm-overlay")
def get_dfm_overlay(part_id: str):
    memory = get_part_memory(part_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Part not found")
    overlays = generate_dfm_overlay(memory.dfm_issues)
    return {"overlays": overlays}

@router.get("/memory/{part_id}/tooling-advice")
def get_tooling_info(part_id: str):
    return tooling_advice(part_id)

@router.get("/memory/{part_id}/handoff-guide")
def get_handoff_guide(part_id: str):
    return generate_handoff_guide(part_id)

@router.get("/memory/{part_id}/cost-simulation")
def get_cost_estimate(part_id: str):
    return simulate_cost(part_id)

@router.get("/memory/{part_id}/cost-curve")
def get_cost_curve(part_id: str):
    from core.cost_optimizer import simulate_cost_curve
    return simulate_cost_curve(part_id)
