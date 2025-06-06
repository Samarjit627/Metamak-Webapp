# vendor_pool_api.py – API to serve vendor discovery suggestions

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Dummy vendor database
import json
from pathlib import Path

VENDOR_DB_PATH = Path("data/vendors_db.json")
if VENDOR_DB_PATH.exists():
    with open(VENDOR_DB_PATH, "r") as f:
        VENDOR_DB = json.load(f)
else:
    VENDOR_DB = [
        {
            "name": "PrecisionFab India",
            "location": "Pune",
            "specialty": "CNC + Sheet Metal",
            "minQty": 50,
            "leadTime": "10–14 days",
            "process": "cnc"
        },
        {
            "name": "RapidMold",
            "location": "Bangalore",
            "specialty": "Injection Molding",
            "minQty": 100,
            "leadTime": "7–10 days",
            "process": "injection molding"
        },
        {
            "name": "Fabtek Solutions",
            "location": "Coimbatore",
            "specialty": "Laser Cutting + Forming",
            "minQty": 20,
            "leadTime": "5–8 days",
            "process": "sheet metal"
        },
        {
            "name": "Toolcraft",
            "location": "Delhi NCR",
            "specialty": "Precision Machining",
            "minQty": 10,
            "leadTime": "6–9 days",
            "process": "cnc"
        }
    ]
    VENDOR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(VENDOR_DB_PATH, "w") as f:
        json.dump(VENDOR_DB, f, indent=2)

@app.get("/vendors")
def get_vendors(process: Optional[str] = None, region: Optional[str] = None, qty: Optional[int] = 1):
    filtered = [v for v in VENDOR_DB if (not process or process in v["process"]) and (not region or region.lower() in v["location"].lower()) and qty >= v["minQty"]]
    return {"vendors": filtered[:5] if filtered else random.sample(VENDOR_DB, 2)}

@app.post("/add_vendor")
def add_vendor(vendor: dict):
    # Add to in-memory DB
    VENDOR_DB.append(vendor)
    # Persist to disk
    VENDOR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(VENDOR_DB_PATH, "w") as f:
        json.dump(VENDOR_DB, f, indent=2)
    return {"status": "ok", "vendor": vendor}
