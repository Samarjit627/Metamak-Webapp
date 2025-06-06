from core.tooling_advisor import tooling_advice


def respond_to_tooling_query(part_id: str) -> str:
    info = tooling_advice(part_id)
    if "error" in info:
        return "❌ I couldn't find tooling advice for this part."

    return f"""
🧰 **Tooling Type**: {info['tool_type']}
📈 **Complexity**: {info['complexity_level']}
💸 **Relative Cost**: {info['cost_estimate']}
💡 **Notes**: {info['recommendations']}
"""
