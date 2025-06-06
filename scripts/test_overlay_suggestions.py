import json
from core.overlay_suggestions import suggest_overlay_geometry


def test_overlay_for_dummy_part():
    part_id = "dummy-part-001"  # Make sure this exists in cad_memory.json
    suggestions = suggest_overlay_geometry(part_id)

    print(f"\n\U0001F4D0 Ghost Overlay Suggestions for Part: {part_id}\n")
    print(json.dumps(suggestions, indent=2))


def test_overlay_for_dummy_part():
    from core.overlay_suggestions import suggest_overlay_geometry
    part_id = "dummy_part"
    overlays = suggest_overlay_geometry(part_id)
    print(overlays)


if __name__ == "__main__":
    test_overlay_for_dummy_part()
