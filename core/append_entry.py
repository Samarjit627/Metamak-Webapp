# append_entry.py – Lightweight FastAPI backend to support KnowledgeAdminPanel UI

from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class KnowledgeEntry(BaseModel):
    text: str
    source: str
    tag: str
    material: str
    process: str

@app.post("/append_entry")
async def append_entry(entry: KnowledgeEntry):
    item = entry.dict()
    item['id'] = str(uuid.uuid4())
    item['timestamp'] = datetime.utcnow().isoformat()

    with open("axis5_knowledge_pool.jsonl", "a") as f:
        f.write(json.dumps(item) + "\n")

    return {"status": "ok", "id": item['id']}
