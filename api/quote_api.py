from fastapi import APIRouter
from fastapi.responses import FileResponse
from core.quote_engine import generate_quote
from core.pdf_export import export_quote_pdf

router = APIRouter()

@router.get("/quote/{part_id}")
def get_quote(part_id: str):
    return generate_quote(part_id)

@router.get("/quote/export/{part_id}")
def export_pdf(part_id: str):
    path = export_quote_pdf(part_id)
    return FileResponse(f".{path}", media_type="application/pdf", filename=path.split("/")[-1])
