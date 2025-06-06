from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from core.memory_store import get_part_memory, save_part_memory
from core.memory_types import DesignIntent, PartMemory

router = APIRouter()

class DesignIntentInput(BaseModel):
    part_id: str
    use_case: str
    environment: str
    production_scale: str
    load_condition: str
    finish_requirement: str

@router.post("/intent/save")
def save_design_intent(data: DesignIntentInput):
    memory = get_part_memory(data.part_id)
    if not memory:
        memory = PartMemory(
            part_id=data.part_id,
            filename="uploaded_file.step",
            uploaded_at=datetime.utcnow(),
            design_intent=None,
            selected_material=None,
            selected_process=None,
            quantity=None,
            dfm_issues=[],
            material_decisions=[],
            decisions=[],
            chat_history=[],
            ai_logs=[],
            last_updated=None
        )

    memory.design_intent = DesignIntent(
        use_case=data.use_case,
        environment=data.environment,
        production_scale=data.production_scale,
        load_condition=data.load_condition,
        finish_requirement=data.finish_requirement
    )

    save_part_memory(memory)
    return {"status": "success", "message": "Design intent saved"}
