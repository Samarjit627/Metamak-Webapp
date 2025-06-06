from fastapi import APIRouter, Request
from core.learning_log import log_v2_acceptance

router = APIRouter()

@router.post("/log/v2-accept/{part_id}")
async def log_v2_accept(part_id: str, request: Request):
    summary = (await request.body()).decode("utf-8")
    log_v2_acceptance(part_id, summary)
    return {"status": "ok"}
