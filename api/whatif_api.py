from fastapi import APIRouter, Query
from typing import Optional
from core.whatif_engine import simulate_whatif

router = APIRouter()

@router.get("/whatif/{part_id}")
def run_whatif(part_id: str, process: str = Query(...), material: str = Query(...), qty: Optional[int] = None):
    """
    Simulate a what-if scenario for a given part, process, and material.
    Returns DFM score, cost, and vendor fit for scenario cards in the UI.
    """
    return simulate_whatif(part_id, process, material, qty)
