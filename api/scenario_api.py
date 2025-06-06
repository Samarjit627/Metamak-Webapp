from fastapi import APIRouter
from gpt_functions.feedback_on_scenario import feedback_on_scenario
from core.learning_log import get_scenario_history

router = APIRouter()

@router.get("/feedback/scenario")
def feedback_scenario_api(part_id: str, chosen_process: str, chosen_material: str, prev_process: str, prev_material: str):
    return feedback_on_scenario(part_id, chosen_process, chosen_material, prev_process, prev_material)

@router.get("/scenario/history/{part_id}")
def get_scenario_history_api(part_id: str):
    return get_scenario_history(part_id)
