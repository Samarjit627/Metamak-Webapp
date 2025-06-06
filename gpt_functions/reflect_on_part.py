from core.learning_log import get_logs_for_part

def reflect_on_part_history(part_id: str) -> str:
    logs = get_logs_for_part(part_id)
    if not logs:
        return "🧠 No history yet — this part has not been analyzed or edited."

    out = ["🧠 **Learning Reflection for Part**:\n"]
    for log in logs:
        out.append(f"- [{log['timestamp']}] **{log['action_type']}** → {log['details']}")
    
    return "\n".join(out)
