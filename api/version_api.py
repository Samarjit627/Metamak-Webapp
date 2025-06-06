from fastapi import APIRouter
from core.version_compare import compare_versions
from core.version_tagging import tag_version, get_version_tag
from gpt_functions.suggest_version_tag import suggest_version_tag

router = APIRouter()

@router.get("/compare/v1v2/{part_id}")
def compare_versions_api(part_id: str):
    data = compare_versions(part_id)
    # Attach tags if available
    if "error" not in data:
        data["tag_v1"] = get_version_tag(part_id, "v1")
        data["tag_v2"] = get_version_tag(part_id, "v2")
    return data

@router.post("/tag-version/{part_id}")
def tag_version_api(part_id: str, version: str, tag: str):
    return tag_version(part_id, version, tag)

@router.get("/suggest-tag/{part_id}")
def suggest_tag_api(part_id: str):
    return suggest_version_tag(part_id)
