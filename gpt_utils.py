import requests


def explain_design_intent(part_id, api_base="http://localhost:8000"):
    """Fetches the summary for a part and returns a mentor-style natural language summary."""

    url = f"{api_base}/api/memory/{part_id}/summary"
    resp = requests.get(url)
    resp.raise_for_status()
    part_summary = resp.json()
    intent = part_summary.get("design_intent", {})
    return (
        f'This part is intended for "{intent.get("use_case", "general purpose")}" and will be used in a(n) '
        f'{intent.get("environment", "unspecified environment")} setting. '
        f'It is designed for {intent.get("production_scale", "unknown scale")} and expected to handle '
        f'{intent.get("load_condition", "unknown load")} conditions. '
        f'A {intent.get("finish_requirement", "default")} finish is requested.'
    )


def suggest_overlay_geometry(
    part_id, gpt_api_call, api_base="http://localhost:8000"
):
    """Fetches part summary and calls GPT/LLM to suggest overlay geometry."""

    url = f"{api_base}/api/memory/{part_id}/summary"
    resp = requests.get(url)
    resp.raise_for_status()
    part_summary = resp.json()
    intent = part_summary.get("design_intent", {})
    prompt = (
        "Based on the following part design intent and process, suggest areas where ribs, fillets, or draft "
        "angles should be added.\n\n"
        f"Input:\n"
        f"- Use case: {intent.get('use_case', '')}\n"
        f"- Process: {part_summary.get('process', '')}\n"
        f"- Environment: {intent.get('environment', '')}\n"
        f"- Load: {intent.get('load_condition', '')}\n"
        f"- Finish: {intent.get('finish_requirement', '')}\n"
        "\nExpected Output:\n"
        "- Add vertical ribs near mount zone to increase stiffness.\n"
        "- Add 1.5\u00b0 draft on outer vertical walls for easier mold release.\n"
        "- Add 2mm radius fillet between flange and base wall to reduce stress."
    )
    return gpt_api_call(prompt)
