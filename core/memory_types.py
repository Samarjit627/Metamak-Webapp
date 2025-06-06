from pydantic import BaseModel
from typing import List, Optional, Dict



class DesignIntent(BaseModel):
    use_case: str
    environment: Optional[str]
    production_scale: Optional[str]
    load_condition: Optional[str]
    finish_requirement: Optional[str]



class DFMIssue(BaseModel):
    issue_id: str
    description: str
    severity: str
    resolved: bool = False
    notes: Optional[str] = None


class MaterialDecision(BaseModel):
    material: str
    process: str
    reason: Optional[str] = None
    timestamp: Optional[str] = None




class PartMemory(BaseModel):
    """
    Stores all relevant information about a part, including its design intent, material,
    process, DFM issues, manufacturability score, and logs for chat and memory.
    """
    part_id: str
    filename: Optional[str] = None
    uploaded_at: Optional[str] = None
    design_intent: Optional[DesignIntent] = None
    selected_material: Optional[str] = None
    selected_process: Optional[str] = None
    quantity: Optional[int] = None
    dfm_issues: List[DFMIssue] = []
    chat_history: List[Dict[str, str]] = []
    memory_log: List[Dict] = []
    manufacturability_score: Optional[int] = None
    last_updated: Optional[str] = None
