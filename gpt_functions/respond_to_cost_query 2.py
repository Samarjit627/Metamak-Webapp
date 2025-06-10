from core.cost_optimizer import simulate_cost

def respond_to_cost_query(part_id: str) -> str:
    result = simulate_cost(part_id)
    if "error" in result:
        return "❌ I couldn't simulate the cost for this part."

    return f"""
💰 **Cost Simulation Summary**  
🔧 Setup Cost: ₹{result['setup_cost']}  
📦 Per Unit Cost: ₹{result['unit_cost']}  
📈 Total Cost: ₹{result['total_cost']}  
💡 Cost Per Part (at {result['note'].split('qty')[-1].strip()}): ₹{result['cost_per_part']}
🧠 Note: {result['note']}
"""
