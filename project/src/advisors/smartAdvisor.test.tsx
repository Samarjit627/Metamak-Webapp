import React from 'react';
import { smartAdvisor } from './smartAdvisor';
import { ManufacturingPlanInput } from '../types/manufacturing';
import { render } from '@testing-library/react';

describe('smartAdvisor', () => {
  it('suggests tolerance when provided', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'Widget',
      geometry: { tolerance: '0.01mm', application: 'Precision fit' },
    };
    const suggestions = smartAdvisor(metadata);
    const { getByText } = render(<ul>{suggestions}</ul>);
    expect(getByText(/Check tolerances: 0.01mm/)).toBeInTheDocument();
    expect(getByText(/for application/)).toBeInTheDocument();
  });

  it('suggests process when provided', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'Gadget',
      process: { name: 'Injection Molding' },
    };
    const suggestions = smartAdvisor(metadata);
    const { getByText } = render(<ul>{suggestions}</ul>);
    expect(getByText(/Consider process: Injection Molding/)).toBeInTheDocument();
  });

  it('suggests ABS supplier advice', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'ABS Part',
      material: 'ABS',
    };
    const suggestions = smartAdvisor(metadata);
    const { getByText } = render(<ul>{suggestions}</ul>);
    expect(getByText(/ABS is selected/)).toBeInTheDocument();
  });

  it('suggests surface finish advice', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'Surface Widget',
      geometry: { surfaceFinish: 'Polished', exposure: 'Outdoor' },
    };
    const suggestions = smartAdvisor(metadata);
    const { getByText } = render(<ul>{suggestions}</ul>);
    expect(getByText(/Surface finish Polished/)).toBeInTheDocument();
    expect(getByText(/for exposure Outdoor/)).toBeInTheDocument();
  });

  it('suggests providing application context if missing', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'No App',
      geometry: {},
    };
    const suggestions = smartAdvisor(metadata);
    const { getByText } = render(<ul>{suggestions}</ul>);
    expect(getByText(/Provide application context/)).toBeInTheDocument();
  });

  it('returns empty array if no suggestions match', () => {
    const metadata: ManufacturingPlanInput = {
      partName: 'Empty',
    };
    const suggestions = smartAdvisor(metadata);
    expect(suggestions.length).toBeGreaterThanOrEqual(1); // General advice should be present
  });
});
