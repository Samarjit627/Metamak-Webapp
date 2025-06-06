# knowledge_ingestion.py
# This script helps ingest structured knowledge entries into Axis5's semantic search engine.

import json
from typing import List, Dict

# Example structure to be expanded with real entries
new_entries: List[Dict] = [
    {
        "id": "rule3",
        "text": "CNC milling typically leaves sharp inside corners unless a fillet is added.",
        "source": "CNC Machining Guide, Haas 2021",
        "tag": "dfm_rule",
        "process": "cnc milling",
        "material": "aluminum"
    },
    {
        "id": "rule4",
        "text": "Sheet metal bending tolerances are generally ±0.5mm for 1mm thick steel.",
        "source": "Sheet Metal Design Handbook, 4th Ed.",
        "tag": "tolerance_guideline",
        "process": "sheet metal",
        "material": "steel"
    },
    {
        "id": "rule5",
        "text": "FDM 3D printing of PLA is not suitable for high-load parts due to low layer adhesion.",
        "source": "3D Printing Materials Handbook, MIT",
        "tag": "material_limitation",
        "process": "fused deposition modeling",
        "material": "PLA"
    }
]

# Save to JSONL format
with open("axis5_knowledge_pool.jsonl", "w") as f:
    for entry in new_entries:
        f.write(json.dumps(entry) + "\n")

print("✅ Knowledge entries written to axis5_knowledge_pool.jsonl")

# You can now load this file in search_engine.py by reading and embedding all entries
# Optionally create a CLI loader to update the search index from disk
