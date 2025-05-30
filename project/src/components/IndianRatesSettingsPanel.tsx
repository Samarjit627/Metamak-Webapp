import React, { useState } from 'react';
import { baseToolingRates, processPricingMatrix } from '../utils/indianRatesConfig';

// Helper to deep clone config
function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export default function IndianRatesSettingsPanel() {
  const [toolingRates, setToolingRates] = useState(deepClone(baseToolingRates));
  const [pricingMatrix, setPricingMatrix] = useState(deepClone(processPricingMatrix));
  const [message, setMessage] = useState('');

  // Handler for tooling rates
  const handleToolingChange = (process: string, value: string) => {
    const num = parseInt(value.replace(/[^\d]/g, ''));
    setToolingRates({ ...toolingRates, [process]: isNaN(num) ? toolingRates[process] : num });
  };

  // Handler for pricing matrix
  const handlePricingChange = (process: string, index: number, field: string, value: string) => {
    const num = parseInt(value.replace(/[^\d]/g, ''));
    const updated = deepClone(pricingMatrix);
    updated[process][index][field] = isNaN(num) ? pricingMatrix[process][index][field] : num;
    setPricingMatrix(updated);
  };

  // Save changes to config (in-memory only for now)
  const handleSave = () => {
    // Here you would persist to backend or localStorage
    setMessage('Rates updated for this session! (Restart app to reset)');
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h2>Indian Market Rates Settings</h2>
      <h3>Tooling Base Rates (₹)</h3>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Process</th>
            <th>Base Tooling Rate (₹)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(toolingRates).map(proc => (
            <tr key={proc}>
              <td>{proc}</td>
              <td>
                <input
                  type="number"
                  value={toolingRates[proc]}
                  min={1000}
                  max={10000000}
                  step={1000}
                  onChange={e => handleToolingChange(proc, e.target.value)}
                  style={{ width: 120 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Process Pricing Matrix (Unit/Tooling/Setup in ₹)</h3>
      {Object.keys(pricingMatrix).map(proc => (
        <div key={proc} style={{ marginBottom: 20, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <h4>{proc}</h4>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Min Qty</th>
                <th>Max Qty</th>
                <th>Unit Price (₹)</th>
                <th>Tooling Cost (₹)</th>
                <th>Setup Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pricingMatrix[proc].map((bracket, idx) => (
                <tr key={idx}>
                  <td><input type="number" value={bracket.minQty} min={1} max={1000000} style={{ width: 80 }} onChange={e => handlePricingChange(proc, idx, 'minQty', e.target.value)} /></td>
                  <td><input type="number" value={bracket.maxQty} min={1} max={10000000} style={{ width: 80 }} onChange={e => handlePricingChange(proc, idx, 'maxQty', e.target.value)} /></td>
                  <td><input type="number" value={bracket.unitPrice} min={1} max={10000000} style={{ width: 100 }} onChange={e => handlePricingChange(proc, idx, 'unitPrice', e.target.value)} /></td>
                  <td><input type="number" value={bracket.toolingCost || ''} min={0} max={10000000} style={{ width: 100 }} onChange={e => handlePricingChange(proc, idx, 'toolingCost', e.target.value)} /></td>
                  <td><input type="number" value={bracket.setupCost || ''} min={0} max={10000000} style={{ width: 100 }} onChange={e => handlePricingChange(proc, idx, 'setupCost', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleSave} style={{ padding: '8px 24px', fontWeight: 600, background: '#1976d2', color: 'white', border: 'none', borderRadius: 4 }}>Save Rates</button>
      {message && <div style={{ marginTop: 16, color: 'green' }}>{message}</div>}
    </div>
  );
}
