import uuid
import json
from pathlib import Path
from typing import List, Dict, Any

LOG_PATH = Path("data/learning_log_v2.json")

def load_logs() -> List[Dict[str, Any]]:
    if not LOG_PATH.exists():
        return []
    return json.loads(LOG_PATH.read_text())

def save_logs(logs: List[Dict[str, Any]]):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(logs, indent=2))

def add_feedback_entry(module: str, partId: str, decision: str, reason: str = None, confidenceScore: float = None, userRole: str = None, metadata: Dict[str, Any] = None):
    logs = load_logs()
    entry = {
        "id": str(uuid.uuid4()),
        "module": module,
        "partId": partId,
        "decision": decision,
        "reason": reason,
        "confidenceScore": confidenceScore,
        "userRole": userRole,
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "metadata": metadata or {}
    }
    logs.append(entry)
    save_logs(logs)
    return entry

def get_all_feedback_logs() -> List[Dict[str, Any]]:
    return load_logs()

def update_feedback_entry(entry_id: str, updates: Dict[str, Any]):
    logs = load_logs()
    for entry in logs:
        if entry["id"] == entry_id:
            entry.update(updates)
            break
    save_logs(logs)
    return entry_id
