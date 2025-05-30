// Use the correct type import
import React, { ReactNode, ReactElement } from 'react';
import { ManufacturingPlanInput } from '../types/manufacturing';
import { ThumbsUp } from 'lucide-react';
// PDF generation (ensure @react-pdf/renderer is installed)
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// What-If Scenario Enhancer UI Card
interface WhatIfScenarioCardProps {
  options: string[];
}

export const WhatIfScenarioCard: React.FC<WhatIfScenarioCardProps> = ({ options }) => {
  return (
    <div className="bg-muted p-4 rounded-xl shadow border border-border mt-4">
      <div className="font-semibold text-sm mb-2 text-muted-foreground">🔀 What-If Simulation Options</div>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {options.map((opt: string, idx: number) => (
          <li key={idx}>{opt}</li>
        ))}
      </ul>
      <div className="flex gap-2 mt-4">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            className="px-3 py-1 rounded bg-secondary text-sm border border-border hover:bg-accent transition"
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// Unified What-If Simulation Engine
export function generateWhatIfOptions(metadata: ManufacturingPlanInput): string[] {
  const options: string[] = [];
  // NOTE: ManufacturingPlanInput does not have process or material directly
  // You may need to adjust this logic based on your actual metadata structure
  const material = (metadata as any)?.material || '';
  const process = (metadata as any)?.process || '';
  const quantity = (metadata as any)?.quantity || 0;

  if (quantity && quantity < 200 && process !== '3d_printing') {
    options.push('Try 3D Printing @ 50 units');
  }
  if (material && process) {
    options.push(`Keep ${process}, Change Material`);
  }
  if (material === 'ABS') {
    options.push('Lock ABS, Compare Cities');
  }
  if (!material || !process) {
    options.push('Try all combinations of material and process');
  }
  options.push('Compare costs at 100 vs 500 vs 1000 units');

  return options;
}

// PDF Document Template
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' }
});

function ManufacturingPlanPDF({ plan }: { plan: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>Nirman Manufacturing Plan</Text>
          <Text>{plan}</Text>
        </View>
      </Page>
    </Document>
  );
}

// Smart Advisor main suggestion logic
// --- Advanced Configurable Suggestion Logic ---

// Type guard helpers
type GeometryMetadata = {
  tolerance?: string;
  application?: string;
  surfaceFinish?: string;
  exposure?: string;
  [k: string]: any;
};

type MaterialMetadata = string | { type?: string; [k: string]: any };

type ProcessMetadata = string | { name?: string; [k: string]: any };

// Configurable suggestion rule type
interface SuggestionRule {
  key: string;
  test: (metadata: ManufacturingPlanInput) => boolean;
  render: (metadata: ManufacturingPlanInput) => ReactNode;
}

// Rules array for advanced/configurable logic
const suggestionRules: SuggestionRule[] = [
  {
    key: 'tolerance',
    test: (metadata) => Boolean((metadata.geometry as GeometryMetadata)?.tolerance),
    render: (metadata) => {
      const tolerance = (metadata.geometry as GeometryMetadata)?.tolerance;
      const application = (metadata.geometry as GeometryMetadata)?.application;
      return (
        <li key="tolerance">
          <span>
            Check tolerances: <b>{tolerance}</b>
            {application ? (<> for application <b>{application}</b>.</>) : null}
          </span>
        </li>
      );
    },
  },
  {
    key: 'process',
    test: (metadata) => {
      const process = (metadata.process as ProcessMetadata);
      return typeof process === 'string' ? !!process : Boolean(process?.name);
    },
    render: (metadata) => {
      const process = (metadata.process as ProcessMetadata);
      const processName = typeof process === 'string' ? process : process?.name;
      return (
        <li key="process">
          <span>Consider process: <b>{processName}</b> for this part.</span>
        </li>
      );
    },
  },
  {
    key: 'abs',
    test: (metadata) => {
      const material = (metadata.material as MaterialMetadata);
      return (typeof material === 'string' ? material : material?.type) === 'ABS';
    },
    render: (metadata) => (
      <li key="abs">
        <span>ABS is selected. Compare suppliers in different cities for best rates.</span>
      </li>
    ),
  },
  {
    key: 'surfaceFinish',
    test: (metadata) => {
      const geometry = metadata.geometry as GeometryMetadata;
      return Boolean(geometry?.surfaceFinish && geometry?.exposure);
    },
    render: (metadata) => {
      const geometry = metadata.geometry as GeometryMetadata;
      return (
        <li key="surfaceFinish">
          <span>
            Surface finish <b>{geometry.surfaceFinish}</b> for exposure <b>{geometry.exposure}</b> may require special treatment.
          </span>
        </li>
      );
    },
  },
  {
    key: 'general',
    test: (metadata) => !(metadata.geometry as GeometryMetadata)?.application,
    render: () => (
      <li key="general">
        <span>Provide application context for more tailored advice.</span>
      </li>
    ),
  },
];

export function smartAdvisor(metadata: ManufacturingPlanInput): ReactNode[] {
  // Apply all rules and collect suggestions
  return suggestionRules.filter(rule => rule.test(metadata)).map(rule => rule.render(metadata));
}

// Manufacturing Plan Card with PDF + What-If
interface ManufacturingPlanCardProps {
  plan: string;
  metadata: ManufacturingPlanInput;
}

export function ManufacturingPlanCard({ plan, metadata }: ManufacturingPlanCardProps): ReactElement {
  const whatIfOptions = generateWhatIfOptions(metadata);

  return (
    <div className="bg-card p-4 rounded-xl shadow mt-4">
      <div className="font-semibold text-base mb-2 text-muted-foreground">📝 Manufacturing Plan</div>
      <div className="mb-2 text-sm whitespace-pre-line">{plan}</div>
      <div className="flex gap-2 mt-3 justify-center">
        <PDFDownloadLink
          document={<ManufacturingPlanPDF plan={plan} />}
          fileName="Nirman_Manufacturing_Plan.pdf"
        >
          {({ loading }: { loading: boolean }) => {
            return (
              <button className="px-3 py-1 rounded bg-secondary text-sm border border-border hover:bg-accent transition">
                {loading ? 'Preparing PDF...' : 'Download PDF'}
              </button>
            );
          }}
        </PDFDownloadLink>
        <button className="px-3 py-1 rounded bg-secondary text-sm border border-border hover:bg-accent transition">
          Simulate Alternatives
        </button>
        <button className="px-3 py-1 rounded bg-secondary text-sm border border-border hover:bg-accent transition">
          Explore DFM Tools
        </button>
      </div>
      <div className="flex gap-3 mt-3 justify-center text-xs text-muted-foreground">
        <span>Was this helpful?</span>
        <ThumbsUp size={16} className="cursor-pointer" />
      </div>
      {whatIfOptions.length > 0 && (
        <WhatIfScenarioCard options={whatIfOptions} />
      )}
    </div>
  );
}

// 🔍 Rationale-based GPT Tool Suggestions (DFM, Cost, Tooling)

export function rationaleForGPTTool(tool: string): string {
  switch (tool) {
    case 'dfm':
      return 'Based on common design-for-manufacturing practices like minimizing undercuts, increasing draft angles, and maintaining uniform wall thickness.\nSource: Autodesk DFM guidelines & Moldflow insights';
    case 'cost':
      return 'Estimates generated by correlating part volume, material type, location, and quantity using industry-averaged benchmarks.\nSource: MIT Manufacturing Cost Model + India SME procurement reports';
    case 'tooling':
      return 'Tooling suggestions are based on process compatibility, expected tolerances, and part geometry complexity.\nSource: Tool & Die Industry Best Practices (DFMA, SME India, NTTF)';
    case 'process':
      return 'Process recommendations consider design features, material, quantity, and lead time goals.\nSource: DFMA Handbook, Xometry process selector, India MSME guides';
    default:
      return 'Generated using internal logic and expert design heuristics.';
  }
}
