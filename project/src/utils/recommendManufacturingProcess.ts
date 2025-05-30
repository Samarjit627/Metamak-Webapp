import { logger } from './chatAnalysis';

interface RecommendationInput {
  material: string;
  materialSubtype: string;
  materialGrade: string;
  quantity: number;
  geometryComplexity?: "Low" | "Medium" | "High";
}

interface ProcessRecommendation {
  primary: string;
  alternatives: string[];
  reasons: string[];
}

export function recommendManufacturingProcess(input: RecommendationInput): { content: string } {
  try {
    logger('Recommending manufacturing process for:', input);

    const {
      material,
      materialSubtype,
      materialGrade,
      quantity,
      geometryComplexity = "Medium"
    } = input;

    // Normalize material input
    const m = material.toLowerCase();
    const subtype = materialSubtype.toLowerCase();
    const isHighComplexity = geometryComplexity === "High";
    const isMediumComplexity = geometryComplexity === "Medium";

    // Define volume categories
    const isLowVolume = quantity < 100;
    const isMediumVolume = quantity >= 100 && quantity < 1000;
    const isHighVolume = quantity >= 1000;

    let recommendation: ProcessRecommendation = {
      primary: "CNC Machining",
      alternatives: [],
      reasons: []
    };

    // Logic based on material + quantity + complexity
    if (m === 'metal') {
      if (subtype.includes('aluminum') || subtype.includes('steel')) {
        if (isLowVolume) {
          recommendation = {
            primary: "CNC Machining",
            alternatives: ["Sheet Metal Fabrication", "Metal 3D Printing (DMLS)"],
            reasons: [
              "Optimal for low volume production",
              "No tooling costs required",
              "High precision and surface finish",
              "Quick turnaround time"
            ]
          };
        } else if (isMediumVolume) {
          recommendation = {
            primary: "Investment Casting",
            alternatives: ["Die Casting", "CNC Machining"],
            reasons: [
              "Cost-effective for medium volumes",
              "Good surface finish and accuracy",
              "Lower tooling costs than die casting",
              "Suitable for complex geometries"
            ]
          };
        } else {
          recommendation = {
            primary: "Die Casting",
            alternatives: ["Investment Casting", "Sheet Metal Forming"],
            reasons: [
              "Most economical for high volumes",
              "Fast production cycle",
              "Excellent dimensional accuracy",
              "Good surface finish"
            ]
          };
        }
      }
    }
    else if (m === 'plastic') {
      if (isLowVolume) {
        recommendation = {
          primary: isHighComplexity ? "SLA 3D Printing" : "FDM 3D Printing",
          alternatives: ["CNC Machining", "Vacuum Forming"],
          reasons: [
            "No tooling costs",
            "Quick turnaround time",
            "Design flexibility",
            isHighComplexity ? "High detail resolution" : "Cost-effective prototyping"
          ]
        };
      } else if (isMediumVolume) {
        recommendation = {
          primary: "Vacuum Forming",
          alternatives: ["Injection Molding", "Rotational Molding"],
          reasons: [
            "Lower tooling costs",
            "Good for medium runs",
            "Quick setup time",
            "Cost-effective for simple shapes"
          ]
        };
      } else {
        recommendation = {
          primary: "Injection Molding",
          alternatives: ["Structural Foam Molding", "Rotational Molding"],
          reasons: [
            "Most economical for high volumes",
            "Excellent part consistency",
            "Fast cycle times",
            "High quality surface finish"
          ]
        };
      }
    }
    else if (m === 'rubber') {
      if (isLowVolume) {
        recommendation = {
          primary: "Compression Molding",
          alternatives: ["Transfer Molding", "Vacuum Casting"],
          reasons: [
            "Lower tooling costs",
            "Good for prototypes and low volumes",
            "Minimal material waste",
            "Suitable for large parts"
          ]
        };
      } else {
        recommendation = {
          primary: "Injection Molding (Rubber)",
          alternatives: ["Transfer Molding", "Compression Molding"],
          reasons: [
            "Fast cycle times",
            "Consistent part quality",
            "Minimal flash and waste",
            "Automated production possible"
          ]
        };
      }
    }
    else if (m === 'wood') {
      recommendation = {
        primary: "CNC Wood Routing",
        alternatives: ["Laser Cutting", "Traditional Woodworking"],
        reasons: [
          "High precision cutting",
          "Complex patterns possible",
          "Good surface finish",
          "Flexible production quantities"
        ]
      };
    }

    // Override for high complexity
    if (isHighComplexity && !recommendation.primary.includes('CNC') && !recommendation.primary.includes('3D')) {
      recommendation.alternatives.unshift("CNC Machining");
      recommendation.reasons.push("Complex geometry may require special consideration");
    }

    // Override for high volume + 3D printing
    if (isHighVolume && recommendation.primary.includes('3D Print')) {
      recommendation.primary = "Injection Molding";
      recommendation.alternatives = ["Structural Foam Molding", "Vacuum Forming"];
      recommendation.reasons = [
        "3D printing not economical at this volume",
        "Injection molding offers better cost per part",
        "Higher production speed",
        "Better part consistency"
      ];
    }

    // Format the response
    const content = `Based on your specifications:

Material: ${material} ${materialSubtype ? `(${materialSubtype})` : ''} ${materialGrade ? `- Grade: ${materialGrade}` : ''}
Quantity: ${quantity} units
Complexity: ${geometryComplexity}

Recommended Primary Process: ${recommendation.primary}

Reasons for Selection:
${recommendation.reasons.map(reason => `• ${reason}`).join('\n')}

Alternative Processes:
${recommendation.alternatives.map(process => `• ${process}`).join('\n')}

Would you like more details about any of these processes or their cost implications?`;

    logger('Process recommendation generated successfully');
    return { content };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error recommending process:', errorMsg);
    throw new Error(`Failed to recommend manufacturing process: ${errorMsg}`);
  }
}