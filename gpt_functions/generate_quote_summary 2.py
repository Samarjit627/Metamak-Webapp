from core.quote_engine import generate_quote

def generate_quote_summary(part_id: str) -> str:
    quote = generate_quote(part_id)
    if "error" in quote:
        return "❌ Quote not available."

    vendor = quote["vendor_recommendation"]
    vendor_str = f"{vendor['name']} ({vendor['city']})" if vendor else "N/A"

    return f"""
📄 **Axis5 Manufacturing Quote Summary**

🧪 Material: {quote['material']}
⚙️ Process: {quote['process']}
📦 Quantity: {quote['quantity']}

💰 Setup Cost: ₹{quote['setup_cost']}
💸 Per Unit Cost: ₹{quote['unit_cost']}
📈 Total Cost: ₹{quote['total_cost']}
⏱️ Estimated Lead Time: {quote['lead_time_days']} days

🏭 Recommended Vendor: {vendor_str}
"""
