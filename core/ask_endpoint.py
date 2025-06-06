# ask_endpoint.py – Axis5 GPT wrapper endpoint using memory-aware reasoning

from fastapi import FastAPI
from pydantic import BaseModel
from memory_gpt_wrapper import generate_axis5_response
from chat_reflector import log_query_from_chat

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    query: str
    part_id: str = None  # Optional, for vendor matching

@app.post("/ask")
async def ask_axis5(req: AskRequest):
    log_query_from_chat(req.query)
    response = generate_axis5_response(req.query)
    # Dummy cost/lead time logic for UI demo; replace with real estimator as needed
    cost_lead_time = {
        "cost": "₹23/unit @ 1000 qty",
        "leadTime": "12–15 working days (Pune)"
    }
    # Vendor discovery logic
    vendors = []
    if getattr(req, 'part_id', None):
        try:
            from vendor_finder import find_matching_vendors
            matches = find_matching_vendors(req.part_id)
            for v in matches:
                vendors.append({
                    "name": v.get("name"),
                    "location": v.get("city"),
                    "specialty": ', '.join(v.get("processes", [])) if v.get("processes") else None,
                    "minQty": v.get("min_order_qty"),
                    "leadTime": "10–14 days"  # TODO: make dynamic
                })
        except Exception as e:
            vendors = []
    else:
        # Demo vendor if no part_id
        vendors = [{
            "name": "PrecisionFab India",
            "location": "Pune",
            "specialty": "CNC + Sheet Metal",
            "minQty": 50,
            "leadTime": "10–14 days"
        }]
    return {
        "response": response,
        "source": "memory+search",
        "costLeadTime": cost_lead_time,
        "vendors": vendors
    }
