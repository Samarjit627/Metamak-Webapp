# memory_gpt_wrapper.py – Enhances GPT responses with memory from reflections + search

import openai
import json
from search_engine import search_knowledge_base

# openai.api_key = "sk-..."  # Replace securely in production

# Load recent reflections
def get_recent_reflections(n=5):
    reflections = []
    with open("axis5_knowledge_pool.jsonl") as f:
        for line in f.readlines():
            entry = json.loads(line)
            if entry.get("tag") == "reflection":
                reflections.append(entry["text"])
    return reflections[-n:]

# Compose system message
def build_system_prompt(user_query):
    memory_insights = get_recent_reflections()
    kb_results = search_knowledge_base(user_query, top_k=2)

    prompt = """
You are Axis5, a manufacturing intelligence assistant.
Use these past reflections and knowledge entries to improve your answer:

Recent reflections:
- {ref_1}
- {ref_2}
- {ref_3}

Relevant knowledge:
- {kb_1} (Source: {src_1})
- {kb_2} (Source: {src_2})

Respond clearly and accurately with traceable logic.
""".format(
        ref_1=memory_insights[0] if len(memory_insights) > 0 else "",
        ref_2=memory_insights[1] if len(memory_insights) > 1 else "",
        ref_3=memory_insights[2] if len(memory_insights) > 2 else "",
        kb_1=kb_results[0]['text'], src_1=kb_results[0]['source'],
        kb_2=kb_results[1]['text'], src_2=kb_results[1]['source']
    )
    return prompt

# Generate response
def generate_axis5_response(user_query: str) -> str:
    system_message = build_system_prompt(user_query)

    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_query}
    ]

    completion = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        temperature=0.4
    )
    return completion.choices[0].message.content

# Example
# print(generate_axis5_response("Can I use PLA for outdoor parts?"))
