import { ManufacturingLocation } from '../types/manufacturing';

export const manufacturingLocations: ManufacturingLocation[] = [
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    costIndex: 0.85,
    laborRate: 350, // INR per hour
    energyCost: 7.5, // INR per kWh
    transportationFactor: 0.9,
    specializations: [
      'Textile Machinery',
      'Auto Components',
      'Chemical Processing Equipment'
    ]
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    costIndex: 1.1,
    laborRate: 450,
    energyCost: 8.2,
    transportationFactor: 0.95,
    specializations: [
      'Automotive Manufacturing',
      'Heavy Machinery',
      'Defense Equipment'
    ]
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    costIndex: 1.25,
    laborRate: 550,
    energyCost: 9.5,
    transportationFactor: 1.0,
    specializations: [
      'Marine Equipment',
      'Aerospace Components',
      'Precision Engineering'
    ]
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    costIndex: 1.15,
    laborRate: 500,
    energyCost: 8.8,
    transportationFactor: 0.95,
    specializations: [
      'Electronics Manufacturing',
      'Auto Components',
      'Industrial Machinery'
    ]
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    costIndex: 1.2,
    laborRate: 525,
    energyCost: 9.0,
    transportationFactor: 1.05,
    specializations: [
      'Aerospace Manufacturing',
      'Electronic Components',
      'Defense Equipment'
    ]
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    costIndex: 1.05,
    laborRate: 425,
    energyCost: 8.0,
    transportationFactor: 0.95,
    specializations: [
      'Automotive Manufacturing',
      'Machine Tools',
      'Heavy Engineering'
    ]
  },
  {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    costIndex: 0.9,
    laborRate: 375,
    energyCost: 7.8,
    transportationFactor: 0.9,
    specializations: [
      'Textile Machinery',
      'Pump Manufacturing',
      'Motor & Controls'
    ]
  },
  {
    city: 'Vadodara',
    state: 'Gujarat',
    costIndex: 0.88,
    laborRate: 360,
    energyCost: 7.6,
    transportationFactor: 0.85,
    specializations: [
      'Chemical Equipment',
      'Industrial Machinery',
      'Power Equipment'
    ]
  }
];

export const getLocationCostFactors = (city: string): LocationCostFactors => {
  const location = manufacturingLocations.find(loc => loc.city === city);
  if (!location) {
    return {
      labor: 1,
      energy: 1,
      transportation: 1,
      overhead: 1
    };
  }

  return {
    labor: location.laborRate / 450, // Normalized to Pune's rate
    energy: location.energyCost / 8.2, // Normalized to Pune's rate
    transportation: location.transportationFactor,
    overhead: location.costIndex
  };
};

export const getLocationSpecialization = (city: string, process: string): number => {
  const location = manufacturingLocations.find(loc => loc.city === city);
  if (!location) return 1;

  const processSpecializations: Record<string, string[]> = {
    'CNC Machining': ['Machine Tools', 'Precision Engineering', 'Auto Components'],
    'Die Casting': ['Auto Components', 'Industrial Machinery'],
    'Injection Molding': ['Auto Components', 'Electronic Components'],
    '3D Printing': ['Aerospace Components', 'Precision Engineering'],
    'Sheet Metal Fabrication': ['Auto Components', 'Heavy Engineering']
  };

  const relevantSpecs = processSpecializations[process] || [];
  const matchingSpecs = location.specializations.filter(spec => 
    relevantSpecs.includes(spec)
  ).length;

  return 1 - (matchingSpecs * 0.05); // Up to 15% discount for specialization
};