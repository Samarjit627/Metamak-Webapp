import json
from datetime import datetime
from typing import Optional
from pathlib import Path
from core.memory_types import PartMemory, MemoryLogEntry

MEMORY_PATH = Path("data/cad_memory.json")



def load_memory() -> dict:
    if MEMORY_PATH.exists():
        with open(MEMORY_PATH, "r") as f:
            return json.load(f)
    return {}



def save_memory(memory_data: dict):
    MEMORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MEMORY_PATH, "w") as f:
        json.dump(memory_data, f, default=str, indent=2)



def get_part_memory(part_id: str) -> Optional[PartMemory]:
    data = load_memory()
    if part_id in data:
        return PartMemory(**data[part_id])
    return None



def save_part_memory(memory: PartMemory):
    data = load_memory()
    data[memory.part_id] = memory.dict()
    save_memory(data)



def log_action(memory: PartMemory, action: str, detail: str) -> PartMemory:
    log_entry = MemoryLogEntry(
        timestamp=datetime.utcnow(),
        action=action,
        detail=detail
    )
    memory.memory_log.append(log_entry)
    return memory
