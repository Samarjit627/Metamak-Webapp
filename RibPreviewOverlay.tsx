// RibPreviewOverlay.tsx
import React from "react";
import { useThree } from "@react-three/fiber";
import { RibSuggestion } from "./ribSuggestorEngine";
import { Html } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  ribs: RibSuggestion[];
  onAccept: () => void;
  onReject: () => void;
};

const RibPreviewOverlay: React.FC<Props> = ({ ribs, onAccept, onReject }) => {
  useThree(); // Ensures component is inside a <Canvas> context

  return (
    <>
      {ribs.map((rib, i) => {
        const { position, height, thickness, draftAngle, filletRadius } = rib;
        const taperFactor = Math.tan((draftAngle * Math.PI) / 180); // radians

        // Create a tapered shape
        const shape = React.useMemo(() => {
          const topWidth = thickness;
          const bottomWidth = thickness * (1 + taperFactor);
          const s = new THREE.Shape();
          s.moveTo(-bottomWidth / 2, 0);
          s.lineTo(bottomWidth / 2, 0);
          s.lineTo(topWidth / 2, height);
          s.lineTo(-topWidth / 2, height);
          s.lineTo(-bottomWidth / 2, 0);
          return s;
        }, [thickness, height, taperFactor]);

        const extrudeSettings = React.useMemo(() => ({
          depth: rib.width,
          bevelEnabled: false,
        }), [rib.width]);

        const geometry = React.useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), [shape, extrudeSettings]);

        return (
          <mesh
            key={`rib-${i}`}
            position={[position[0], position[1], position[2]]}
            geometry={geometry}
          >
            <meshStandardMaterial
              transparent
              opacity={0.4}
              color="orange"
            />
            {/* Tooltip on hover */}
            <Html position={[0, height + 2, 0]}>
              <div className="bg-white text-black p-2 rounded shadow-md text-xs">
                <b>Rib Suggestion</b><br />
                Thickness: {thickness.toFixed(2)} mm<br />
                Height: {height.toFixed(2)} mm<br />
                Draft: {draftAngle}°<br />
                Fillet: {filletRadius} mm
              </div>
            </Html>
          </mesh>
        );
      })}

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-50">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg"
          onClick={onAccept}
        >
          ✅ Accept Ribs
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg"
          onClick={onReject}
        >
          ❌ Reject
        </button>
      </div>
    </>
  );
};

export default RibPreviewOverlay;
