from core.handoff_guide import generate_handoff_guide


def respond_to_handoff_query(part_id: str) -> str:
    guide = generate_handoff_guide(part_id)
    if "error" in guide:
        return "❌ Handoff guide not available for this part."

    checklist = "\n".join([f"• {item}" for item in guide["key_checklist"]])
    return (
        f"""
📦 **Manufacturing Handoff Guide**

🏭 Vendor Type: {guide['vendor_type']}  
🧾 Recommended File Types: {', '.join(guide['recommended_file_types'])}  
🔢 Quantity: {guide['quantity']}  
🧪 Material: {guide['material']}  
⚙️ Process: {guide['process']}

📋 **Checklist**:
{checklist}
"""
    )
