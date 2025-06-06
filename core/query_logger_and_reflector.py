# query_logger_and_reflector.py – Logs Axis5 queries and proposes new rules based on usage

import json
from datetime import datetime
from collections import Counter
import re

# 1. Log new query (call this after every user query)
def log_query(query: str):
    with open("axis5_query_log.jsonl", "a") as f:
        f.write(json.dumps({"query": query, "timestamp": datetime.utcnow().isoformat()}) + "\n")

# Example:
# log_query("What is the minimum wall for ABS?")

# 2. Analyze logs and auto-generate reflection entries

def reflect_from_logs():
    with open("axis5_query_log.jsonl") as f:
        queries = [json.loads(line)["query"] for line in f.readlines()]

    phrases = []
    for q in queries:
        q = q.lower()
        for match in re.findall(r"\b(?:wall thickness|tolerance|material|cost|vendor|lead time)\b.*?\b(?:[a-z]{3,})\b", q):
            phrases.append(match.strip())

    common = Counter(phrases).most_common(5)
    reflection_entries = []
    for phrase, count in common:
        reflection_entries.append({
            "id": f"auto_reflect_{phrase[:15].replace(' ', '_')}",
            "text": f"Users frequently ask about: {phrase}",
            "source": "Axis5 Query Reflection",
            "tag": "reflection",
            "material": None,
            "process": None
        })

    with open("axis5_knowledge_pool.jsonl", "a") as f:
        for e in reflection_entries:
            f.write(json.dumps(e) + "\n")

    print(f"✅ Reflected {len(reflection_entries)} items from recent logs.")

# reflect_from_logs()  # Run periodically (daily or weekly)
