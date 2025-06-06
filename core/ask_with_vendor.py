# ask_with_vendor.py – Updated Axis5 GPT /ask endpoint with vendor suggestions

from fastapi import FastAPI
from pydantic import BaseModel
from memory_gpt_wrapper import generate_axis5_response
from chat_reflector import log_query_from_chat
from search_engine import search_knowledge_base
import requests

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class AskRequest(BaseModel):
    query: str
    process: str = "cnc"
    region: str = ""
    qty: int = 10

@app.post("/ask")
async def ask_axis5(req: AskRequest):
    log_query_from_chat(req.query)
    response_text = generate_axis5_response(req.query)
    citations = search_knowledge_base(req.query, top_k=3)
    formatted = [{"text": c["text"], "source": c["source"]} for c in citations]

    try:
        vendor_res = requests.get("http://localhost:8001/vendors", params={
            "process": req.process,
            "region": req.region,
            "qty": req.qty
        })
        vendors = vendor_res.json().get("vendors", [])
    except:
        vendors = []

    return {
        "response": response_text,
        "source": "memory+search",
        "citations": formatted,
        "costLeadTime": {
            "cost": "₹23/unit @ {} qty".format(req.qty),
            "leadTime": "Varies by vendor location"
        },
        "vendors": vendors
    }
