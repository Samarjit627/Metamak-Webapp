from core.memory_types import DFMIssue
from typing import List

def suggest_fix_explanation(issue: DFMIssue) -> str:
    return f"""
🛠️ **Fix for Issue: {issue.issue_type}**  
{issue.suggested_fix or 'No suggestion available'}  
\n💡 Reason: {issue.description}
\n🎯 Suggested Action: Modify your CAD model to apply this fix — for example:  
- Add draft angle (1.5°)  
- Increase wall thickness to 1.5mm  
- Add fillet of 2mm radius  
- Add powder escape holes  
\n👻 You can also view this in the ghost overlay hints.
"""
