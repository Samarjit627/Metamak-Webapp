from core.memory_store import get_part_memory

def feedback_on_scenario(part_id: str, chosen_process: str, chosen_material: str, prev_process: str, prev_material: str) -> str:
    memory = get_part_memory(part_id)
    if not memory:
        return "❌ No memory found."

    qty = memory.quantity or 1
    intent = memory.design_intent.use_case if memory.design_intent else "general use"

    return f"""
🧠 **AI Feedback on Your Chosen Scenario**

You selected **{chosen_process} + {chosen_material}** for use case: *{intent}*, quantity: {qty}.

Compared to your previous setup (**{prev_process} + {prev_material}**), this choice:

- May offer improved manufacturability for your scale
- May increase or decrease per-part cost depending on vendor and setup
- Is better suited for: [Insert reasoning from GPT here later]
- Suggested based on material-process compatibility and DFM score impact

✅ This is a good decision if:
- You're producing under/over 1000 units
- You need improved finish, durability, or tolerance

📝 Next: You can rerun DFM + Cost + Tooling to finalize.
"""
