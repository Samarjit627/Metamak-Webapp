# Axis5 Semantic Search Engine Core (search_engine.py)
# This module connects your internal knowledge base (rules, citations, reflection memory)
# with GPT to handle search queries like "How do I manufacture this part in rubber?"

import json
from typing import List, Dict
from sentence_transformers import SentenceTransformer, util
import faiss
import numpy as np
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Initialize app
app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load semantic embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

import os

# Load dynamic knowledge base from JSONL if present
knowledge_data = []
jsonl_path = os.path.join(os.path.dirname(__file__), "axis5_knowledge_pool.jsonl")
if os.path.exists(jsonl_path):
    with open(jsonl_path, "r") as f:
        for line in f:
            try:
                knowledge_data.append(json.loads(line))
            except Exception as e:
                print(f"[WARN] Skipping invalid knowledge entry: {e}")

# Add hardcoded entries for bootstrapping (optional, can be removed later)
knowledge_data += [
    {
        "id": "rule1",
        "text": "Injection molding requires a minimum wall thickness of 1mm for ABS.",
        "source": "Machinery's Handbook, Section 3.1",
        "tag": "dfm_rule",
        "process": "injection molding",
        "material": "ABS"
    },
    {
        "id": "rule2",
        "text": "Compression molding is ideal for rubber components in medium-volume production.",
        "source": "Rubber Processing Guide, McMaster 2022",
        "tag": "process_guideline",
        "process": "compression molding",
        "material": "rubber"
    },
    {
        "id": "reflection1",
        "text": "Users frequently reject nylon for outdoor use due to UV degradation.",
        "source": "Axis5 Reflection Log",
        "tag": "reflection",
        "material": "nylon"
    }
]

# Embed the knowledge base
corpus = [item["text"] for item in knowledge_data]
corpus_embeddings = model.encode(corpus, convert_to_tensor=True)
index = faiss.IndexFlatL2(corpus_embeddings.shape[1])
index.add(np.array(corpus_embeddings))

# Request body schema
class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

# Main search function
def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict]:
    query_embedding = model.encode(query, convert_to_tensor=True)
    query_vector = np.array([query_embedding])
    distances, indices = index.search(query_vector, top_k)
    results = []
    for idx in indices[0]:
        item = knowledge_data[idx]
        results.append({
            "text": item["text"],
            "source": item["source"],
            "tag": item["tag"],
            "material": item.get("material"),
            "process": item.get("process")
        })
    return results

# API endpoint
@app.post("/search")
async def search_endpoint(req: QueryRequest):
    results = search_knowledge_base(req.query, req.top_k)
    return {"results": results}

# Example test call (if needed standalone)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("search_engine:app", host="0.0.0.0", port=8000, reload=True)
