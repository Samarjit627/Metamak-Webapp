from core.memory_store import get_part_memory
from gpt_functions.explain_dfm import explain_dfm_issues


def respond_to_dfm_query(part_id: str) -> str:
    memory = get_part_memory(part_id)
    if not memory:
        return "❌ I couldn't find any data for this part."

    explanation = explain_dfm_issues(memory.dfm_issues)
    score = memory.manufacturability_score or "unknown"

    return (
        f"""
📊 **Manufacturability Score**: {score}/100  
{explanation}
\n👻 *You can also view these issues as ghost overlays in the CAD viewer.*
"""
    )
