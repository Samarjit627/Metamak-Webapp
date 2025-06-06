from fastapi import FastAPI
from api.cad_memory_api import router as cad_memory_router
from api.design_intent_api import router as intent_router
from api.vendor_api import router as vendor_router
from api.material_api import router as material_router
from api.learning_api import router as learning_router
from api.whatif_api import router as whatif_router
from api.scenario_api import router as scenario_router
from api.quote_api import router as quote_router
from api.version_api import router as version_router
from api.v2_log_api import router as v2_log_router
from api.version_timeline_api import router as version_timeline_router
from api.learning_log_v2_api import router as learning_log_v2_router
from api.score_log_api import router as score_log_router

app = FastAPI(title="Axis5 CAD Memory API")

app.include_router(cad_memory_router, prefix="/api")
app.include_router(intent_router)
app.include_router(vendor_router, prefix="/vendor")
app.include_router(material_router, prefix="/material/recommend")
app.include_router(learning_router)
app.include_router(whatif_router)
app.include_router(scenario_router)
app.include_router(quote_router)
app.include_router(version_router)
app.include_router(v2_log_router)
app.include_router(version_timeline_router)
app.include_router(learning_log_v2_router)
app.include_router(score_log_router)
