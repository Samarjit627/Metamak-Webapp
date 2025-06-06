# add_vendor_api.py – Adds new vendor entries to vendor_pool.jsonl

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Vendor(BaseModel):
    name: str
    location: str
    specialty: str
    minQty: int
    leadTime: str
    process: str

VENDOR_FILE = "vendor_pool.jsonl"

@app.post("/add_vendor")
def add_vendor(v: Vendor):
    with open(VENDOR_FILE, "a") as f:
        f.write(json.dumps(v.dict()) + "\n")
    return {"status": "ok", "vendor": v.dict()}
