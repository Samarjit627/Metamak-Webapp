// ToleranceOverlay.tsx
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { ToleranceIssue } from "./toleranceCheckerEngine";

type Props = {
  issues: ToleranceIssue[];
};

const ToleranceOverlay: React.FC<Props> = ({ issues }) => {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const toggleAccept = (id: string) => {
    setAccepted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getColor = (status: string) => {
    switch (status) {
      case "Too Tight": return "red";
      case "Too Loose": return "yellow";
      default: return "green";
    }
  };

  return (
    <>
      {issues.map((issue) => {
        const [x, y, z] = issue.location;
        const color = getColor(issue.status);

        return (
          <mesh
            key={issue.featureId}
            position={[x, y, z]}
            onClick={() => toggleAccept(issue.featureId)}
          >
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial
              color={accepted[issue.featureId] ? "gray" : color}
              transparent
              opacity={0.6}
            />

            <Html position={[0, 2.5, 0]}>
              <div className="bg-white text-black text-xs p-2 rounded shadow-lg">
                <b>{issue.status}</b><br />
                Tol: ±{issue.appliedTolerance} mm<br />
                Reco: ±{issue.recommendation} mm<br />
                Std: {issue.standard}
              </div>
            </Html>
          </mesh>
        );
      })}
    </>
  );
};

export default ToleranceOverlay;
