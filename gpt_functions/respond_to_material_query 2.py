from core.material_recommender import recommend_materials

def respond_to_material_query(part_id: str) -> str:
    mats = recommend_materials(part_id)
    if "error" in mats[0] or "message" in mats[0]:
        return "❌ Couldn't find good material matches for this part."

    out = ["🔍 **Recommended Materials:**"]
    for m in mats:
        out.append(f"""
🧪 **{m['name']}** ({m['type']})
✅ Properties: {', '.join(m['properties'])}
🎯 Good For: {', '.join(m['suitable_for'])}
⚠️ Avoid If: {', '.join(m['not_suitable_for'])}
""")
    return "\n".join(out)
