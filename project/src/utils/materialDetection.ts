import { MaterialInfo } from '../types/manufacturing';
import { materialCategories } from '../data/materials';

export function detectMaterial(text: string): MaterialInfo {
  const normalizedText = text.toLowerCase();
  let result: MaterialInfo = {
    type: 'Unknown',
    category: '',
    confidence: 0
  };

  // Check each material category
  for (const category of materialCategories) {
    for (const material of category.options) {
      // Check if material name or description matches
      if (
        normalizedText.includes(material.value.toLowerCase()) ||
        normalizedText.includes(material.label.toLowerCase()) ||
        (material.description && normalizedText.includes(material.description.toLowerCase()))
      ) {
        result.type = material.value;
        result.category = category.type;
        result.confidence = 0.8;

        // Check for grades
        if (material.grades) {
          for (const grade of material.grades) {
            if (normalizedText.includes(grade.grade.toLowerCase())) {
              result.grade = grade.grade;
              result.confidence = 0.9;
              break;
            }
          }
        }
      }
    }
  }

  // Check for specifications
  const specMatch = text.match(/ASTM\s+[A-Z][0-9]+|[A-Z]+\s*[0-9]+|Grade\s+[0-9]+/i);
  if (specMatch) {
    result.specification = specMatch[0];
    result.confidence = Math.min(result.confidence + 0.1, 1.0);
  }

  // Check for treatments
  const treatments = [
    'annealed', 'tempered', 'hardened', 'normalized',
    'quenched', 'stress relieved', 'solution treated'
  ];

  for (const treatment of treatments) {
    if (normalizedText.includes(treatment)) {
      result.treatment = treatment;
      result.confidence = Math.min(result.confidence + 0.1, 1.0);
      break;
    }
  }

  return result;
}

export function extractMaterialProperties(text: string): Record<string, string> {
  const properties: Record<string, string> = {};
  const normalizedText = text.toLowerCase();

  // Extract hardness
  const hardnessMatch = normalizedText.match(/(?:hardness|shore)\s*[a-d]?\s*(\d+)/i);
  if (hardnessMatch) {
    properties.hardness = hardnessMatch[0];
  }

  // Extract tensile strength
  const tensileMatch = normalizedText.match(/tensile\s*strength\s*[:\s]\s*(\d+(?:\.\d+)?)\s*(?:mpa|psi)/i);
  if (tensileMatch) {
    properties.tensileStrength = tensileMatch[0];
  }

  // Extract elongation
  const elongationMatch = normalizedText.match(/elongation\s*(?:at\s*break)?\s*[:\s]\s*(\d+)%/i);
  if (elongationMatch) {
    properties.elongation = elongationMatch[0];
  }

  // Extract density
  const densityMatch = normalizedText.match(/density\s*[:\s]\s*(\d+(?:\.\d+)?)\s*(?:g\/cm3|kg\/m3)/i);
  if (densityMatch) {
    properties.density = densityMatch[0];
  }

  return properties;
}

export function validateMaterialCompatibility(material: string, process: string): boolean {
  // Add material-process compatibility validation logic here
  return true;
}