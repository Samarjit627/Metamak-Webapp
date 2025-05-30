import { describe, expect, test } from 'vitest';
import { calculateManufacturingCosts, applyGradeAdjustment, applyLocationAdjustment } from '../utils/costUtils';

describe('Cost Calculation', () => {
  test('should calculate costs for metal parts', () => {
    const costs = calculateManufacturingCosts({
      material: 'metal',
      materialSubtype: 'aluminum',
      materialGrade: 'Standard',
      volume: 100,
      complexity: 0.5,
      quantity: 1000
    });

    expect(costs.materialCost).toBeGreaterThan(0);
    expect(costs.laborCost).toBeGreaterThan(0);
    expect(costs.toolingCost).toBeGreaterThan(0);
    expect(costs.totalUnitCost).toBeGreaterThan(0);
    expect(costs.totalBatchCost).toBe(costs.totalUnitCost * 1000);
  });

  test('should apply quantity discounts', () => {
    const lowVolume = calculateManufacturingCosts({
      material: 'plastic',
      materialSubtype: 'abs',
      materialGrade: 'Standard',
      volume: 100,
      complexity: 0.5,
      quantity: 100
    });

    const highVolume = calculateManufacturingCosts({
      material: 'plastic',
      materialSubtype: 'abs',
      materialGrade: 'Standard',
      volume: 100,
      complexity: 0.5,
      quantity: 10000
    });

    expect(highVolume.totalUnitCost).toBeLessThan(lowVolume.totalUnitCost);
  });

  test('should cap complexity impact', () => {
    const lowComplexity = calculateManufacturingCosts({
      material: 'metal',
      materialSubtype: 'steel',
      materialGrade: 'Standard',
      volume: 100,
      complexity: 0.3,
      quantity: 1000
    });

    const highComplexity = calculateManufacturingCosts({
      material: 'metal',
      materialSubtype: 'steel',
      materialGrade: 'Standard',
      volume: 100,
      complexity: 0.9,
      quantity: 1000
    });

    const complexityIncrease = (highComplexity.totalUnitCost - lowComplexity.totalUnitCost) / lowComplexity.totalUnitCost;
    expect(complexityIncrease).toBeLessThanOrEqual(0.28); // Max 28% increase
  });

  test('should apply grade adjustments', () => {
    const baseCost = 100;
    const medicalGrade = applyGradeAdjustment(baseCost, 'Medical');
    const standardGrade = applyGradeAdjustment(baseCost, 'Standard');

    expect(medicalGrade).toBe(baseCost * 1.5);
    expect(standardGrade).toBe(baseCost);
  });

  test('should apply location adjustments', () => {
    const baseCost = 100;
    const mumbaiCost = applyLocationAdjustment(baseCost, 'Mumbai');
    const ahmedabadCost = applyLocationAdjustment(baseCost, 'Ahmedabad');

    expect(mumbaiCost).toBe(baseCost * 1.25);
    expect(ahmedabadCost).toBe(baseCost * 0.95);
  });
});