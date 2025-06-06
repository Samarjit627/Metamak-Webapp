// WallOverlay.tsx
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { WallRiskResult } from "./wallScannerEngine";

type Props = {
  walls: WallRiskResult[];
};

const WallOverlay: React.FC<Props> = ({ walls }) => {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const getColor = (status: string) => {
    switch (status) {
      case "Too Thin": return "red";
      case "Too Thick": return "blue";
      case "Borderline": return "yellow";
      default: return "green";
    }
  };

  const toggle = (id: string) => {
    setAccepted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {walls.map(wall => (
        <mesh
          key={wall.id}
          position={wall.location}
          onClick={() => toggle(wall.id)}
        >
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshStandardMaterial
            color={accepted[wall.id] ? "gray" : getColor(wall.status)}
            transparent
            opacity={0.6}
          />

          <Html position={[0, 3, 0]}>
            <div className="bg-white text-black text-xs p-2 rounded shadow">
              <b>{wall.status}</b><br />
              Thickness: {wall.thickness.toFixed(2)} mm<br />
              Reco: {wall.recommended} mm<br />
              Notes: {wall.notes || "–"}
            </div>
          </Html>
        </mesh>
      ))}
    </>
  );
};

export default WallOverlay;
