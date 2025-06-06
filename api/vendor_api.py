from fastapi import APIRouter
from core.vendor_finder import find_matching_vendors

router = APIRouter()

@router.get("/vendor/find/{part_id}")
def get_vendor_matches(part_id: str):
    return find_matching_vendors(part_id)
