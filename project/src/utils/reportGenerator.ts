import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Message } from '../store/chatStore';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:reportGenerator');

interface ReportData {
  partName: string;
  material: string;
  manufacturingProcess: string;
  quantity: number;
  chatHistory: Message[];
  analysis: {
    manufacturabilityScore: number;
    costOptimization: {
      suggestions: string[];
      potentialSavings: number;
    };
    qualityPrediction: {
      defectProbability: number;
      criticalAreas: string[];
    };
    sustainabilityMetrics: {
      materialEfficiency: number;
      energyScore: number;
      wasteReduction: string[];
    };
  };
}

export async function generateManufacturingReport(data: ReportData): Promise<Blob> {
  logger('Generating manufacturing report for:', { partName: data.partName });

  try {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 153);
    doc.text('Manufacturing Analysis Report', 20, yPos);
    yPos += 15;

    // Part Information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Part Name: ${data.partName}`, 20, yPos);
    yPos += 10;
    doc.text(`Material: ${data.material}`, 20, yPos);
    yPos += 10;
    doc.text(`Manufacturing Process: ${data.manufacturingProcess}`, 20, yPos);
    yPos += 10;
    doc.text(`Quantity: ${data.quantity}`, 20, yPos);
    yPos += 20;

    // Manufacturability Score
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Manufacturability Analysis', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const score = Math.round(data.analysis.manufacturabilityScore * 100);
    doc.text(`Overall Score: ${score}%`, 20, yPos);
    yPos += 20;

    // Cost Optimization
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Cost Optimization', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Potential Savings: ₹${data.analysis.costOptimization.potentialSavings.toLocaleString()}`, 20, yPos);
    yPos += 10;

    doc.text('Suggestions:', 20, yPos);
    yPos += 5;
    data.analysis.costOptimization.suggestions.forEach(suggestion => {
      yPos += 7;
      doc.text(`• ${suggestion}`, 25, yPos);
    });
    yPos += 15;

    // Quality Prediction
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Quality Analysis', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const defectProb = Math.round(data.analysis.qualityPrediction.defectProbability * 100);
    doc.text(`Expected Pass Rate: ${100 - defectProb}%`, 20, yPos);
    yPos += 10;

    doc.text('Critical Areas:', 20, yPos);
    yPos += 5;
    data.analysis.qualityPrediction.criticalAreas.forEach(area => {
      yPos += 7;
      doc.text(`• ${area}`, 25, yPos);
    });
    yPos += 15;

    // Sustainability Metrics
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Sustainability Analysis', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const materialEff = Math.round(data.analysis.sustainabilityMetrics.materialEfficiency * 100);
    const energyScore = Math.round(data.analysis.sustainabilityMetrics.energyScore * 100);
    doc.text(`Material Efficiency: ${materialEff}%`, 20, yPos);
    yPos += 7;
    doc.text(`Energy Score: ${energyScore}%`, 20, yPos);
    yPos += 10;

    doc.text('Waste Reduction Strategies:', 20, yPos);
    yPos += 5;
    data.analysis.sustainabilityMetrics.wasteReduction.forEach(strategy => {
      yPos += 7;
      doc.text(`• ${strategy}`, 25, yPos);
    });
    yPos += 15;

    // Manufacturing Requirements Table
    doc.addPage();
    autoTable(doc, {
      head: [['Parameter', 'Requirement']],
      body: [
        ['Material', data.material],
        ['Process', data.manufacturingProcess],
        ['Quantity', data.quantity.toString()],
        ['Surface Finish', 'Ra 1.6 μm'],
        ['Tolerance', '±0.1 mm'],
        ['Quality Standard', 'ISO 9001:2015']
      ],
      startY: 20,
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 153] }
    });

    // Chat History
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Manufacturing Requirements Discussion', 20, 20);

    const chatRows = data.chatHistory.map(msg => [
      msg.type === 'user' ? 'User' : 'AI Assistant',
      msg.content,
      new Date(msg.timestamp).toLocaleString()
    ]);

    autoTable(doc, {
      head: [['Role', 'Message', 'Time']],
      body: chatRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 153] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 120 },
        2: { cellWidth: 40 }
      },
      styles: { fontSize: 10 }
    });

    logger('Report generation completed successfully');
    return doc.output('blob');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error generating report:', errorMsg);
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate manufacturing report: ${errorMsg}`);
  }
}