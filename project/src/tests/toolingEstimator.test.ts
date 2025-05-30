import { describe, expect, test } from 'vitest';
import { estimateTooling } from '../utils/toolingEstimator';

describe('Tooling Estimator', () => {
  test('should estimate tooling cost for injection molding', () => {
    const estimate = estimateTooling({
      material: 'plastic',
      process: 'Injection Molding',
      quantity: 5000,
      complexity: "Medium",
      partSize: "Medium"
    });

    expect(estimate).toBeGreaterThan(50000); // Should be at least ₹50k for injection mold
    expect(estimate).toBeLessThan(300000); // Should not exceed ₹300k for medium complexity
  });

  test('should estimate tooling cost for compression molding', () => {
    const estimate = estimateTooling({
      material: 'rubber',
      process: 'Compression Molding',
      quantity: 10000,
      complexity: "High",
      partSize: "Large"
    });

    expect(estimate).toBeGreaterThan(80000); // Should be at least ₹80k for compression mold
    expect(estimate).toBeLessThan(400000); // Should not exceed ₹400k even for complex parts
  });

  test('should handle 3D printing with zero tooling cost', () => {
    const estimate = estimateTooling({
      material: 'plastic',
      process: '3D Printing',
      quantity: 100,
      complexity: "High",
      partSize: "Small"
    });

    expect(estimate).toBe(0); // 3D printing should have no tooling cost
  });

  test('should estimate tooling cost for sheet metal', () => {
    const estimate = estimateTooling({
      material: 'metal',
      process: 'Sheet Metal',
      quantity: 2000,
      complexity: "Low",
      partSize: "Small"
    });

    expect(estimate).toBeGreaterThan(30000); // Should be at least ₹30k for simple dies
    expect(estimate).toBeLessThan(150000); // Should not exceed ₹150k for simple sheet metal
  });
});