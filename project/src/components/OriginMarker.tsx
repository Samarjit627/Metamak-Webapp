import React from 'react';
import { Sphere, Line } from '@react-three/drei';

/**
 * OriginMarker renders a small sphere at the origin with lines along the X, Y, and Z axes.
 */
const ORIGIN_RADIUS = 0.5;
const AXIS_LENGTH = 5;
const AXIS_THICKNESS = 0.1;

export const OriginMarker: React.FC = () => (
  <group>
    {/* Sphere at the origin */}
    <Sphere args={[ORIGIN_RADIUS, 32, 32]}>
      <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
    </Sphere>
    {/* X Axis (Red) */}
    <Line points={[[0, 0, 0], [AXIS_LENGTH, 0, 0]]} color="red" lineWidth={4} />
    {/* Y Axis (Green) */}
    <Line points={[[0, 0, 0], [0, AXIS_LENGTH, 0]]} color="green" lineWidth={4} />
    {/* Z Axis (Blue) */}
    <Line points={[[0, 0, 0], [0, 0, AXIS_LENGTH]]} color="blue" lineWidth={4} />
  </group>
);

export default OriginMarker;
