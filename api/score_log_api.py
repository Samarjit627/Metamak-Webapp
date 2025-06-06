from fastapi import APIRouter, Request
from pathlib import Path
import json

router = APIRouter()
SCORE_LOG_PATH = Path("data/score_log.json")

@router.post("/log/score")
async def log_score(request: Request):
    data = await request.json()
    if not SCORE_LOG_PATH.exists():
        SCORE_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        logs = []
    else:
        logs = json.loads(SCORE_LOG_PATH.read_text())
    logs.append(data)
    SCORE_LOG_PATH.write_text(json.dumps(logs, indent=2))
    return {"status": "ok"}
