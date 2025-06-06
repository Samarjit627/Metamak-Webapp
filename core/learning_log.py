import json
from pathlib import Path
from typing import List, Dict

LOG_PATH = Path("data/learning_log.json")

def load_logs() -> List[Dict]:
    try:
        if LOG_PATH.exists():
            return json.loads(LOG_PATH.read_text())
    except (OSError, json.JSONDecodeError) as e:
        print(f"[LearningLog] Error loading logs: {e}")
    return []

def save_logs(logs: List[Dict]):
    try:
        LOG_PATH.write_text(json.dumps(logs, indent=2))
    except OSError as e:
        print(f"[LearningLog] Error saving logs: {e}")

def log_scenario_try(part_id: str, process: str, material: str, score: int, cost: float, applied: bool):
    logs = load_logs()
    logs.append({
        "part_id": part_id,
        "type": "scenario_try",
        "process": process,
        "material": material,
        "dfm_score": score,
        "cost_per_part": cost,
        "applied": applied,
        "timestamp": __import__('datetime').datetime.now().isoformat()
    })
    save_logs(logs)

def get_scenario_history(part_id: str):
    return [log for log in load_logs() if log.get("type") == "scenario_try" and log["part_id"] == part_id]

def log_action(part_id: str, action_type: str, details: str, user_id: str = "anonymous"):
    logs = load_logs()
    logs.append({
        "part_id": part_id,
        "action_type": action_type,
        "details": details,
        "user_id": user_id,
        "timestamp": __import__('datetime').datetime.now().isoformat()
    })
    save_logs(logs)

def log_v2_acceptance(part_id: str, summary: str):
    log_action(
        part_id,
        "Promoted V2",
        f"V2 accepted: {summary}"
    )

def get_logs_for_part(part_id: str) -> List[Dict]:
    return [log for log in load_logs() if log["part_id"] == part_id]
