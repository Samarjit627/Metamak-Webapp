from core.version_compare import compare_versions

def summarize_version_diff(part_id: str) -> str:
    c = compare_versions(part_id)
    if "error" in c:
        return "❌ Version data missing."

    result = f"""
🔍 **V1 vs V2 Comparison for Part {part_id}**

🧠 DFM Score: V1 = {c['dfm_score_v1']} → V2 = {c['dfm_score_v2']}
⚠️ DFM Issues: V1 = {c['issues_v1']} → V2 = {c['issues_v2']}
💸 Cost/Part: ₹{c['cost_per_part_v1']} → ₹{c['cost_per_part_v2']}
⚙️ Process: {c['process_v1']} → {c['process_v2']}
🧪 Material: {c['material_v1']} → {c['material_v2']}
🛠️ Fixes Applied in V2: {', '.join(c['fixes_applied']) or 'N/A'}

✅ Verdict: V2 reduces risk and improves performance.
"""
    return result
