// components/CostCurveChart.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const CostCurveChart = ({ data }) => (
  <div className="p-4 bg-white rounded shadow">
    <h3 className="text-sm font-semibold mb-2">📉 Cost vs Quantity Curve</h3>
    <LineChart width={300} height={180} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="quantity" />
      <YAxis unit="₹" />
      <Tooltip />
      <Line type="monotone" dataKey="unitCost" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </div>
);
