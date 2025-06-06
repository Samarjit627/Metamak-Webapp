# vendor_api.py – Unified API for vendor onboarding and search (JSONL-backed)

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import json
import random
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

VENDOR_FILE = "vendor_pool.jsonl"

class Vendor(BaseModel):
    name: str
    location: str
    specialty: str
    minQty: int
    leadTime: str
    process: str

# Helper to load JSONL
def load_vendors():
    try:
        with open(VENDOR_FILE, "r") as f:
            return [json.loads(line) for line in f if line.strip()]
    except FileNotFoundError:
        return []

# Helper to append to JSONL
def append_vendor(vendor: dict):
    with open(VENDOR_FILE, "a") as f:
        f.write(json.dumps(vendor) + "\n")

@app.get("/vendors")
def get_vendors(process: Optional[str] = None, region: Optional[str] = None, qty: Optional[int] = 1):
    all_vendors = load_vendors()
    filtered = [v for v in all_vendors if
                (not process or process.lower() in v.get("process", "").lower()) and
                (not region or region.lower() in v.get("location", "").lower()) and
                qty >= v.get("minQty", 0)]
    return {"vendors": filtered[:5] if filtered else random.sample(all_vendors, min(2, len(all_vendors)))}

@app.post("/add_vendor")
def add_vendor(v: Vendor):
    append_vendor(v.dict())
    return {"status": "ok", "vendor": v.dict()}
