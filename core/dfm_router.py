from core.dfm_rules_cnc import dfm_rules_cnc
from core.dfm_rules_injection_molding import dfm_rules_injection_molding
from core.dfm_rules_sheet_metal import dfm_rules_sheet_metal
from core.dfm_rules_fdm import dfm_rules_fdm
from core.dfm_rules_casting import dfm_rules_casting
from core.dfm_rules_blow_molding import dfm_rules_blow_molding
from core.dfm_rules_thermoforming import dfm_rules_thermoforming
from core.dfm_rules_turning import dfm_rules_turning
from core.dfm_rules_post_processing import dfm_rules_post_processing
from core.dfm_rules_vacuum_forming import dfm_rules_vacuum_forming
from core.dfm_rules_wood_turning import dfm_rules_wood_turning
from core.dfm_rules_compression_molding import dfm_rules_compression_molding
from core.dfm_rules_die_casting import dfm_rules_die_casting

def get_dfm_rules(material: str, process: str):
    material = material.lower()
    process = process.lower()

    if "plastic" in material:
        if "injection" in process:
            return dfm_rules_injection_molding()
        elif "vacuum" in process:
            return dfm_rules_vacuum_forming()
        elif "thermo" in process:
            return dfm_rules_thermoforming()
        elif "blow" in process:
            return dfm_rules_blow_molding()
        elif "compression" in process:
            return dfm_rules_compression_molding()
        elif "fdm" in process:
            return dfm_rules_fdm()
    elif "rubber" in material:
        if "compression" in process:
            return dfm_rules_compression_molding()
    elif "metal" in material:
        if "die cast" in process:
            return dfm_rules_die_casting()
        elif "cnc" in process or "machining" in process:
            return dfm_rules_cnc()
        elif "sheet" in process:
            return dfm_rules_sheet_metal()
        elif "turning" in process or "lathe" in process:
            return dfm_rules_turning()
    elif "wood" in material:
        if "turning" in process:
            return dfm_rules_wood_turning()

    return dfm_rules_post_processing()
