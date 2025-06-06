# chat_reflector.py – Attach this to Axis5 chat handler to log and auto-reflect queries

import json
import re
from datetime import datetime
from collections import Counter

query_log_file = "axis5_query_log.jsonl"
knowledge_pool_file = "axis5_knowledge_pool.jsonl"

# Log every chat query
def log_query_from_chat(query: str):
    with open(query_log_file, "a") as f:
        f.write(json.dumps({"query": query, "timestamp": datetime.utcnow().isoformat()}) + "\n")

# Reflect intelligently every N queries (buffered or timed)
def reflect_and_generate(max_reflections: int = 3):
    with open(query_log_file) as f:
        queries = [json.loads(line)["query"] for line in f.readlines()[-50:]]  # limit to recent ones

    key_phrases = []
    for q in queries:
        q = q.lower()
        for match in re.findall(r"\b(?:wall thickness|tolerance|material|lead time|cost|draft angle|vendor)\b.*?\b([a-z]{3,})\b", q):
            key_phrases.append(match.strip())

    top_reflections = Counter(key_phrases).most_common(max_reflections)
    new_entries = []
    for phrase, count in top_reflections:
        new_entries.append({
            "id": f"chat_reflect_{phrase}",
            "text": f"Users repeatedly ask about: {phrase}",
            "source": "Chat Reflection Agent",
            "tag": "reflection",
            "material": None,
            "process": None,
            "timestamp": datetime.utcnow().isoformat()
        })

    with open(knowledge_pool_file, "a") as f:
        for e in new_entries:
            f.write(json.dumps(e) + "\n")

    print(f"✅ Added {len(new_entries)} reflection entries from chat queries.")

# Example integration
# log_query_from_chat("What's the draft angle for ABS injection molding?")
# reflect_and_generate()
