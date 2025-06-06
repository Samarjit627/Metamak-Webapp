from core.vendor_finder import find_matching_vendors

def respond_to_vendor_query(part_id: str) -> str:
    vendors = find_matching_vendors(part_id)
    if "error" in vendors:
        return "❌ I couldn't find any vendor matches for this part."

    out = ["🏭 **Top Vendor Matches:**"]
    for v in vendors:
        out.append(f"""
🔹 **{v['name']}** — {v['city']} (Tier {v['tier']})  
📞 Contact: {v['contact']}  
✅ Match Score: {v['match_score']}  
💬 {v['notes']}
""")
    return "\n".join(out)
