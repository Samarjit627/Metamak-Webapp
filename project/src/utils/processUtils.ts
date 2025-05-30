// utils/processUtils.ts
export function suggestManufacturingProcesses({ material, volume, quantity, wallThickness }: { material: string, volume: number, quantity: number, wallThickness: number }) {
  let primary = '';
  const alternatives: string[] = [];

  if (material.toLowerCase() === 'metal') {
    if (quantity < 20) primary = 'cnc_machining';
    else primary = 'investment_casting';
    alternatives.push('sheet_metal', 'die_casting');
  } else if (material.toLowerCase() === 'plastic') {
    if (quantity < 10) primary = '3d_printing';
    else primary = 'injection_molding';
    alternatives.push('vacuum_forming', 'rotational_molding');
  } else if (material.toLowerCase() === 'rubber') {
    primary = 'compression_molding';
    alternatives.push('injection_molding');
  } else if (material.toLowerCase() === 'wood') {
    primary = 'cnc_machining';
    alternatives.push('laser_cutting');
  } else {
    primary = 'cnc_machining';
    alternatives.push('3d_printing');
  }

  return { primary, alternatives };
}
