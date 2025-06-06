from fastapi import APIRouter
from core.version_timeline import get_all_versions

router = APIRouter()

@router.get("/versions/{part_id}")
def get_version_timeline(part_id: str):
    return get_all_versions(part_id)
