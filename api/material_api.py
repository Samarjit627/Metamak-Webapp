from fastapi import APIRouter
from core.material_recommender import recommend_materials

router = APIRouter()

@router.get("/material/recommend/{part_id}")
def get_material_recommendations(part_id: str):
    return recommend_materials(part_id)
