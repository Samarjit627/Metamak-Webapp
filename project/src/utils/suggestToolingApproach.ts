import { useModelStore } from '../store/modelStore';
import { getPartContext } from './getPartContext';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:toolingApproach');

interface ToolingApproach {
  moldType: string;
  cavities: number;
  notes: string[];
}

export function suggestToolingApproach(metadata: any): { content: string } {
  try {
    logger('Suggesting tooling approach for:', metadata);

    // Get part context from CAD analysis
    const partContext = getPartContext();
    logger('Retrieved part context:', partContext);

    const material = metadata.material?.toLowerCase() || 'unknown';
    const quantity = metadata.quantity || 1;
    const volume = partContext.volume || 0;
    const complexity = partContext.complexity || 0;
    const undercuts = partContext.undercuts || false;

    let approach: ToolingApproach = {
      moldType: 'Standard Injection Mold',
      cavities: 1,
      notes: []
    };

    // Determine tooling approach based on material
    if (material.includes('metal')) {
      approach.moldType = 'Die Casting Mold';
      if (quantity > 5000) approach.cavities = 2;
      approach.notes.push('Consider draft angles and cooling channel placement');
    } else if (material.includes('rubber')) {
      approach.moldType = 'Compression or Transfer Mold';
      approach.notes.push('Compression molding is best for low-volume and large rubber parts');
    } else if (material.includes('wood')) {
      approach.moldType = 'CNC Fixtures / Templates';
      approach.notes.push('Tooling typically consists of jigs or templates for routing, not traditional molds');
    } else if (material.includes('plastic')) {
      if (quantity < 500) {
        approach.moldType = '3D Printed Prototype Mold';
        approach.notes.push('Rapid tooling can be used for prototyping');
      } else if (quantity >= 500 && quantity < 5000) {
        approach.moldType = 'Aluminum Mold';
        approach.notes.push('Suitable for moderate production volumes');
      } else {
        approach.moldType = 'Steel Injection Mold';
        approach.cavities = Math.ceil(quantity / 10000);
        approach.notes.push('High volume production, durable steel recommended');
      }
    }

    // Add notes based on part characteristics
    if (undercuts) {
      approach.notes.push('Undercuts detected — slides or lifters may be required');
    }
    if (complexity > 0.6) {
      approach.notes.push('Highly complex part — consider modular tooling or lifters');
    }

    // Add volume-specific notes
    if (volume < 10) {
      approach.notes.push('Small part volume — consider micro-tooling techniques');
    } else if (volume > 1000) {
      approach.notes.push('Large part volume — ensure proper cooling and material flow');
    }

    // Format the response
    const content = `
Tooling Strategy Recommendation:
- Recommended Tooling: ${approach.moldType}
- Number of Cavities: ${approach.cavities}
- Part Volume: ${volume.toFixed(2)} cm³
- Complexity Score: ${complexity.toFixed(2)}

Key Considerations:
${approach.notes.map(note => `• ${note}`).join('\n')}

Additional Notes:
• Estimated tool life: ${estimateToolLife(approach.moldType)} cycles
• Maintenance interval: ${estimateMaintenanceInterval(approach.moldType)} cycles
• Material compatibility: ${checkMaterialCompatibility(material, approach.moldType)}
    `.trim();

    logger('Tooling approach suggestion completed');
    return { content };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error suggesting tooling approach:', errorMsg);
    throw new Error(`Failed to suggest tooling approach: ${errorMsg}`);
  }
}

function estimateToolLife(moldType: string): string {
  switch (moldType) {
    case 'Steel Injection Mold':
      return '500,000+';
    case 'Aluminum Mold':
      return '100,000';
    case 'Die Casting Mold':
      return '250,000';
    case '3D Printed Prototype Mold':
      return '50-100';
    default:
      return 'Varies based on usage';
  }
}

function estimateMaintenanceInterval(moldType: string): string {
  switch (moldType) {
    case 'Steel Injection Mold':
      return '50,000';
    case 'Aluminum Mold':
      return '10,000';
    case 'Die Casting Mold':
      return '25,000';
    case '3D Printed Prototype Mold':
      return '10-20';
    default:
      return 'Based on wear patterns';
  }
}

function checkMaterialCompatibility(material: string, moldType: string): string {
  if (moldType === '3D Printed Prototype Mold' && !material.includes('plastic')) {
    return 'Limited - check material properties';
  }
  if (moldType === 'Die Casting Mold' && !material.includes('metal')) {
    return 'Not compatible';
  }
  return 'Compatible';
}