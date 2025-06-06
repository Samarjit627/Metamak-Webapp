from fastapi import APIRouter, HTTPException, Request
from core.learning_log_v2 import add_feedback_entry, get_all_feedback_logs, update_feedback_entry

router = APIRouter()

@router.get("/logs/feedback")
def get_logs():
    return get_all_feedback_logs()

@router.post("/logs/feedback")
def add_log(request: Request):
    data = request.json()
    entry = add_feedback_entry(**data)
    return entry

@router.patch("/logs/feedback/{entry_id}")
def update_log(entry_id: str, request: Request):
    data = request.json()
    update_feedback_entry(entry_id, data)
    return {"status": "ok"}
