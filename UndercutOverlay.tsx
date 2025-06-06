// UndercutOverlay.tsx
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { UndercutRegion } from "./undercutScannerEngine";

type Props = {
  undercuts: UndercutRegion[];
};

const UndercutOverlay: React.FC<Props> = ({ undercuts }) => {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setAccepted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getColor = (severity: number) => {
    if (severity > 0.85) return "red";
    if (severity > 0.5) return "orange";
    return "yellow";
  };

  return (
    <>
      {undercuts.map((uc) => (
        <mesh
          key={uc.id}
          position={uc.center}
          onClick={() => toggle(uc.id)}
        >
          <sphereGeometry args={[2.0, 16, 16]} />
          <meshStandardMaterial
            color={accepted[uc.id] ? "gray" : getColor(uc.severity)}
            transparent
            opacity={0.6}
          />
          <Html position={[0, 2.5, 0]}>
            <div className="bg-white text-black text-xs p-2 rounded shadow">
              <b>Undercut Risk</b><br />
              Severity: {Math.round(uc.severity * 100)}%<br />
              Tooling issue likely
            </div>
          </Html>
        </mesh>
      ))}
    </>
  );
};

export default UndercutOverlay;
