from typing import List
from core.memory_types import DFMIssue


def explain_dfm_issues(issues: List[DFMIssue]) -> str:
    if not issues:
        return "✅ This part currently has no DFM issues flagged."

    output = ["🔍 **DFM Risk Summary**:\n"]
    for issue in issues:
        output.append(
            f"""
🛠️ **Issue:** {issue.issue_type}  
📄 **Detail:** {issue.description}  
⚠️ **Severity:** {issue.severity.upper()}  
💡 **Suggested Fix:** {issue.suggested_fix or 'N/A'}
            """
        )
    return "\n".join(output)
