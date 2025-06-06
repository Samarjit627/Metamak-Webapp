// components/VendorScoutPanel.tsx
import React, { useState } from "react";
import { findVendors } from "@/functions/vendorFinder";

export const VendorScoutPanel: React.FC<{
  partId: string;
  process: string;
  material: string;
  quantity: number;
}> = ({ partId, process, material, quantity }) => {
  const [location, setLocation] = useState("India (Tier 2/3)");
  const [response, setResponse] = useState("");

  const scout = async () => {
    const result = await findVendors({
      process,
      material,
      quantity,
      location,
      complexity: "medium",
    });
    setResponse(result);
  };

  return (
    <div className="space-y-2 border p-4 rounded bg-white">
      <h3 className="font-medium text-sm">🔍 Vendor Finder</h3>
      <input
        placeholder="Preferred location (e.g., Pune, Tier 2 cities)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-1 w-full text-sm"
      />
      <button onClick={scout} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">
        🧠 Find Vendors
      </button>
      {response && (
        <div className="mt-2 bg-yellow-50 p-2 text-xs whitespace-pre-wrap rounded">
          {response}
        </div>
      )}
    </div>
  );
};
