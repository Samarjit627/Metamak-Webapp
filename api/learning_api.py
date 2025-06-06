from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from core.learning_log import log_action, get_logs_for_part

router = APIRouter()

class LearningLogEntry(BaseModel):
    part_id: str
    user_id: str
    action_type: str
    details: str
    timestamp: str

class LogResponse(BaseModel):
    status: str

@router.post("/log/{part_id}", response_model=LogResponse)
def write_learning_log(part_id: str, action_type: str, details: str):
    log_action(part_id, action_type, details)
    return {"status": "logged"}

@router.get("/log/{part_id}", response_model=List[LearningLogEntry])
def read_learning_log(part_id: str):
    return get_logs_for_part(part_id)
