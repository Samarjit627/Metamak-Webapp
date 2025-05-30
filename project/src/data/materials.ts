import { MaterialGrade, MaterialOption, MaterialCategory } from '../types/manufacturing';

export const materialCategories: MaterialCategory[] = [
  {
    type: 'metal',
    label: 'Metal',
    options: [
      {
        value: 'aluminum',
        label: 'Aluminum',
        description: 'Lightweight, corrosion-resistant metal',
        properties: {
          density: 2.7,
          tensileStrength: '70-700 MPa',
          meltingPoint: '660°C',
          hardness: '15-150 HB'
        },
        costFactor: 1.0,
        grades: [
          {
            grade: '1100 Aluminum',
            applications: 'Food packaging, chemical equipment',
            pricePerKg: 180,
            properties: 'Excellent formability, high corrosion resistance'
          },
          {
            grade: '2024 Aluminum',
            applications: 'Aircraft structures, military equipment',
            pricePerKg: 250,
            properties: 'High strength, good fatigue resistance'
          },
          {
            grade: '3003 Aluminum',
            applications: 'General fabrication, cooking utensils',
            pricePerKg: 190,
            properties: 'Good workability, moderate strength'
          },
          {
            grade: '5052 Aluminum',
            applications: 'Marine applications, electronic parts',
            pricePerKg: 220,
            properties: 'Good corrosion resistance, moderate strength'
          },
          {
            grade: '6061 Aluminum',
            applications: 'Structural components, marine fittings',
            pricePerKg: 200,
            properties: 'Good strength, excellent corrosion resistance'
          },
          {
            grade: '7075 Aluminum',
            applications: 'Aircraft components, high-stress parts',
            pricePerKg: 280,
            properties: 'Very high strength, good fatigue resistance'
          }
        ]
      },
      {
        value: 'mid-steel',
        label: 'Mild Steel',
        description: 'Low carbon steel with good formability and weldability',
        properties: {
          density: 7.85,
          tensileStrength: '400-550 MPa',
          meltingPoint: '1450-1520°C',
          hardness: '120-180 HB'
        },
        costFactor: 0.8,
        grades: [
          {
            grade: 'ASTM A36',
            applications: 'Structural shapes, plates, general construction',
            pricePerKg: 65,
            properties: 'Good weldability, formability, and machinability'
          },
          {
            grade: 'SAE 1018',
            applications: 'Shafts, pins, general machined parts',
            pricePerKg: 70,
            properties: 'Good machinability, moderate strength'
          },
          {
            grade: 'SAE 1020',
            applications: 'Forgings, general engineering components',
            pricePerKg: 75,
            properties: 'Good balance of strength and formability'
          },
          {
            grade: 'IS 2062 E250',
            applications: 'Structural applications, bridges, towers',
            pricePerKg: 68,
            properties: 'Indian standard structural steel, good weldability'
          },
          {
            grade: 'IS 2062 E350',
            applications: 'Heavy structural applications, high-strength requirements',
            pricePerKg: 72,
            properties: 'Higher strength variant of IS 2062'
          }
        ]
      },
      {
        value: 'stainless-steel',
        label: 'Stainless Steel',
        description: 'Corrosion-resistant steel alloy with chromium',
        properties: {
          density: 7.8,
          tensileStrength: '500-1100 MPa',
          meltingPoint: '1400-1450°C',
          hardness: '150-300 HB'
        },
        costFactor: 1.5,
        grades: [
          {
            grade: 'SS 304',
            applications: 'Food equipment, kitchen sinks, architectural',
            pricePerKg: 220,
            properties: 'Good corrosion resistance, non-magnetic, good formability'
          },
          {
            grade: 'SS 316',
            applications: 'Marine equipment, chemical processing, medical implants',
            pricePerKg: 280,
            properties: 'Superior corrosion resistance, good at elevated temperatures'
          },
          {
            grade: 'SS 201',
            applications: 'Consumer goods, automotive trim, structural',
            pricePerKg: 180,
            properties: 'Lower cost alternative to 304, slightly magnetic'
          },
          {
            grade: 'SS 321',
            applications: 'Aircraft exhaust systems, high-temperature equipment',
            pricePerKg: 300,
            properties: 'Titanium stabilized, excellent high-temperature resistance'
          },
          {
            grade: 'SS 904L',
            applications: 'Chemical processing, pulp & paper industry',
            pricePerKg: 450,
            properties: 'Super austenitic, excellent resistance to acids'
          },
          {
            grade: 'SS 17-4 PH',
            applications: 'Aerospace, chemical processing, oil & gas',
            pricePerKg: 380,
            properties: 'Precipitation hardening, high strength, good corrosion resistance'
          }
        ]
      },
      {
        value: 'titanium',
        label: 'Titanium',
        description: 'Lightweight, high-strength, corrosion-resistant metal',
        properties: {
          density: 4.5,
          tensileStrength: '240-1200 MPa',
          meltingPoint: '1668°C',
          hardness: '120-370 HB'
        },
        costFactor: 5.0,
        grades: [
          {
            grade: 'Grade 1 Titanium',
            applications: 'Chemical processing, desalination',
            pricePerKg: 800,
            properties: 'Excellent formability, moderate strength'
          },
          {
            grade: 'Grade 2 Titanium',
            applications: 'Industrial applications, marine equipment',
            pricePerKg: 850,
            properties: 'Good strength, excellent corrosion resistance'
          },
          {
            grade: 'Grade 5 (Ti-6Al-4V)',
            applications: 'Aerospace, medical implants, high-performance parts',
            pricePerKg: 1200,
            properties: 'High strength, light weight, excellent corrosion resistance'
          },
          {
            grade: 'Grade 7 Titanium',
            applications: 'Chemical processing, aggressive environments',
            pricePerKg: 1500,
            properties: 'Superior corrosion resistance in reducing acids'
          },
          {
            grade: 'Grade 23 (ELI Ti-6Al-4V)',
            applications: 'Medical implants, aerospace critical components',
            pricePerKg: 1800,
            properties: 'Extra low interstitials, superior ductility and fracture resistance'
          }
        ]
      }
    ]
  },
  {
    type: 'plastic',
    label: 'Plastic',
    options: [
      {
        value: 'abs',
        label: 'ABS (Acrylonitrile Butadiene Styrene)',
        description: 'Tough, impact-resistant thermoplastic',
        properties: {
          density: 1.05,
          tensileStrength: '40-50 MPa',
          meltingPoint: '105°C (glass transition)',
          hardness: 'R105-R110 (Rockwell)'
        },
        costFactor: 1.0,
        grades: [
          {
            grade: 'Standard ABS',
            applications: 'Consumer products, toys, automotive components',
            pricePerKg: 120,
            properties: 'Good impact resistance, easy to process'
          },
          {
            grade: 'Heat Resistant ABS',
            applications: 'Automotive interior, appliance housings',
            pricePerKg: 150,
            properties: 'Higher heat deflection temperature, good dimensional stability'
          },
          {
            grade: 'Flame Retardant ABS',
            applications: 'Electronics housings, appliances, electrical components',
            pricePerKg: 180,
            properties: 'UL94 V-0 rated, reduced flammability'
          },
          {
            grade: 'ABS+PC Blend',
            applications: 'Automotive components, electronics, safety equipment',
            pricePerKg: 200,
            properties: 'Higher impact strength, better heat resistance than standard ABS'
          },
          {
            grade: 'UV Resistant ABS',
            applications: 'Outdoor equipment, signage, automotive exterior parts',
            pricePerKg: 160,
            properties: 'Improved weatherability, color stability'
          }
        ]
      },
      {
        value: 'pp',
        label: 'Polypropylene (PP)',
        description: 'Versatile thermoplastic with good chemical resistance',
        properties: {
          density: 0.9,
          tensileStrength: '30-40 MPa',
          meltingPoint: '160-170°C',
          hardness: 'R80-R100 (Rockwell)'
        },
        costFactor: 0.8,
        grades: [
          {
            grade: 'Homopolymer PP',
            applications: 'Packaging, containers, household items',
            pricePerKg: 100,
            properties: 'Good stiffness, chemical resistance, economical'
          },
          {
            grade: 'Copolymer PP',
            applications: 'Automotive parts, consumer goods',
            pricePerKg: 110,
            properties: 'Better impact resistance than homopolymer, especially at low temperatures'
          },
          {
            grade: 'Glass-Filled PP',
            applications: 'Structural components, appliance parts',
            pricePerKg: 130,
            properties: 'Increased stiffness and dimensional stability'
          },
          {
            grade: 'Flame Retardant PP',
            applications: 'Electrical components, appliances',
            pricePerKg: 150,
            properties: 'UL94 rated, reduced flammability'
          },
          {
            grade: 'Medical Grade PP',
            applications: 'Medical devices, pharmaceutical packaging',
            pricePerKg: 180,
            properties: 'USP Class VI compliant, sterilizable'
          }
        ]
      },
      {
        value: 'polycarbonate',
        label: 'Polycarbonate (PC)',
        description: 'Extremely tough, transparent thermoplastic',
        properties: {
          density: 1.2,
          tensileStrength: '55-75 MPa',
          meltingPoint: '147°C (glass transition)',
          hardness: 'M70-M80 (Rockwell)'
        },
        costFactor: 1.8,
        grades: [
          {
            grade: 'Optical Grade PC',
            applications: 'Eyewear, optical discs, transparent components',
            pricePerKg: 220,
            properties: 'High optical clarity, UV resistant'
          },
          {
            grade: 'Medical Grade PC',
            applications: 'Medical devices, surgical equipment, sterilizable components',
            pricePerKg: 280,
            properties: 'Biocompatible, sterilization resistant'
          },
          {
            grade: 'Flame Retardant PC',
            applications: 'Electronics housings, lighting fixtures',
            pricePerKg: 250,
            properties: 'UL94 V-0 rated, self-extinguishing'
          },
          {
            grade: 'UV Stabilized PC',
            applications: 'Outdoor signage, automotive glazing, skylights',
            pricePerKg: 240,
            properties: 'Enhanced weatherability, yellowing resistance'
          },
          {
            grade: 'Glass-Filled PC',
            applications: 'Structural components, high-load applications',
            pricePerKg: 230,
            properties: 'Increased stiffness, dimensional stability'
          }
        ]
      }
    ]
  },
  {
    type: 'rubber',
    label: 'Rubber',
    options: [
      {
        value: 'natural-rubber',
        label: 'Natural Rubber',
        description: 'Elastic material derived from latex of rubber trees',
        properties: {
          density: 0.93,
          tensileStrength: '20-30 MPa',
          meltingPoint: 'N/A (decomposes)',
          hardness: '30-90 Shore A'
        },
        costFactor: 1.0,
        grades: [
          {
            grade: 'RSS3 (Ribbed Smoked Sheet)',
            applications: 'Tires, vibration mounts, footwear',
            pricePerKg: 150,
            properties: 'High elasticity, good tear resistance'
          },
          {
            grade: 'Pale Crepe',
            applications: 'Medical devices, adhesives, specialty products',
            pricePerKg: 180,
            properties: 'Light color, high purity, premium grade'
          },
          {
            grade: 'TSR20 (Technically Specified Rubber)',
            applications: 'Industrial products, automotive components',
            pricePerKg: 160,
            properties: 'Consistent properties, controlled viscosity'
          },
          {
            grade: 'Latex Concentrate',
            applications: 'Gloves, balloons, adhesives',
            pricePerKg: 170,
            properties: 'Liquid form, high elasticity, easy processing'
          }
        ]
      },
      {
        value: 'synthetic-rubber',
        label: 'Synthetic Rubber',
        description: 'Artificially produced elastomers with specialized properties',
        properties: {
          density: 0.95,
          tensileStrength: '10-25 MPa',
          meltingPoint: 'N/A (decomposes)',
          hardness: '40-95 Shore A'
        },
        costFactor: 1.5,
        grades: [
          {
            grade: 'SBR (Styrene-Butadiene Rubber)',
            applications: 'Tires, footwear, conveyor belts',
            pricePerKg: 140,
            properties: 'Good abrasion resistance, economical'
          },
          {
            grade: 'EPDM (Ethylene Propylene Diene Monomer)',
            applications: 'Weather seals, roofing, automotive',
            pricePerKg: 160,
            properties: 'Excellent weather and ozone resistance'
          },
          {
            grade: 'NBR (Nitrile Butadiene Rubber)',
            applications: 'Oil seals, hoses, fuel systems',
            pricePerKg: 180,
            properties: 'Excellent oil and fuel resistance'
          },
          {
            grade: 'Silicone Rubber',
            applications: 'Medical devices, bakeware, electronics',
            pricePerKg: 350,
            properties: 'Extreme temperature resistance, biocompatibility'
          },
          {
            grade: 'Fluoroelastomer (FKM/Viton)',
            applications: 'High-temperature seals, chemical processing',
            pricePerKg: 650,
            properties: 'Exceptional chemical and heat resistance'
          }
        ]
      }
    ]
  },
  {
    type: 'wood',
    label: 'Wood',
    options: [
      {
        value: 'teak',
        label: 'Teak Wood',
        description: 'Premium hardwood with excellent weather resistance',
        properties: {
          density: 0.63,
          tensileStrength: '75-150 MPa',
          meltingPoint: 'N/A (combusts)',
          hardness: '1070 Janka'
        },
        costFactor: 2.5,
        grades: [
          {
            grade: 'Grade A Teak',
            applications: 'Marine, shipbuilding, premium outdoor furniture',
            pricePerKg: 3200,
            properties: 'Excellent weather resistance, minimal defects, uniform color'
          },
          {
            grade: 'Grade B Teak',
            applications: 'Premium furniture, doors, decorative elements',
            pricePerKg: 2800,
            properties: 'Good weather resistance, minor color variations, small knots'
          },
          {
            grade: 'Plantation Teak',
            applications: 'Furniture, flooring, outdoor applications',
            pricePerKg: 2500,
            properties: 'Cultivated, more color variation, good durability'
          }
        ]
      },
      {
        value: 'pine',
        label: 'Pine',
        description: 'Softwood with good workability and moderate strength',
        properties: {
          density: 0.42,
          tensileStrength: '40-80 MPa',
          meltingPoint: 'N/A (combusts)',
          hardness: '380-710 Janka'
        },
        costFactor: 0.7,
        grades: [
          {
            grade: 'Eastern White Pine',
            applications: 'Furniture, paneling, trim, crafts',
            pricePerKg: 60,
            properties: 'Soft, stable, easy to work with, takes paint well'
          },
          {
            grade: 'Yellow Pine (Southern)',
            applications: 'Construction lumber, flooring, outdoor structures',
            pricePerKg: 50,
            properties: 'Harder than white pine, more resinous, good strength'
          },
          {
            grade: 'Ponderosa Pine',
            applications: 'Millwork, furniture, windows, doors',
            pricePerKg: 70,
            properties: 'Moderately soft, stable, low resin content'
          }
        ]
      }
    ]
  }
];

// Material helper functions
export function getDefaultMaterialSubtype(materialType: 'metal' | 'plastic' | 'rubber' | 'wood'): string {
  const category = materialCategories.find(cat => cat.type === materialType);
  return category?.options[0]?.value || '';
}

export function getMaterialOption(materialType: 'metal' | 'plastic' | 'rubber' | 'wood', materialSubtype: string): MaterialOption | undefined {
  const category = materialCategories.find(cat => cat.type === materialType);
  return category?.options.find(opt => opt.value === materialSubtype);
}

export function getMaterialLabel(materialType: 'metal' | 'plastic' | 'rubber' | 'wood', materialSubtype: string): string {
  const option = getMaterialOption(materialType, materialSubtype);
  return option?.label || materialSubtype;
}

export function getMaterialCostFactor(materialType: 'metal' | 'plastic' | 'rubber' | 'wood', materialSubtype: string): number {
  const option = getMaterialOption(materialType, materialSubtype);
  return option?.costFactor || 1.0;
}

export function getMaterialGrade(materialType: 'metal' | 'plastic' | 'rubber' | 'wood', materialSubtype: string, gradeIndex: number = 0): MaterialGrade | undefined {
  const option = getMaterialOption(materialType, materialSubtype);
  return option?.grades?.[gradeIndex];
}

export function getDefaultMaterialGrade(materialType: 'metal' | 'plastic' | 'rubber' | 'wood', materialSubtype: string): MaterialGrade | undefined {
  return getMaterialGrade(materialType, materialSubtype, 0);
}