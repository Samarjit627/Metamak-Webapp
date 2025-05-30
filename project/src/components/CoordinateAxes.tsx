import { useRef } from 'react';
import { Line, Text } from '@react-three/drei';
import { useModelStore } from '../store/modelStore';

export const CoordinateAxes = () => {
  const { viewerState } = useModelStore();
  const axesRef = useRef(null);

  if (!viewerState.showAxes) return null;

  const axisLength = 5;
  const axisThickness = 2;

  return (
    <group ref={axesRef}>
      {/* X Axis - Red */}
      <Line
        points={[[0, 0, 0], [axisLength, 0, 0]]}
        color="red"
        lineWidth={axisThickness}
      />
      <Text
        position={[axisLength + 0.2, 0, 0]}
        color="red"
        fontSize={0.3}
        anchorX="left"
      >
        +X
      </Text>
      <Line
        points={[[0, 0, 0], [-axisLength, 0, 0]]}
        color="red"
        lineWidth={axisThickness}
        opacity={0.5}
      />
      <Text
        position={[-axisLength - 0.2, 0, 0]}
        color="red"
        fontSize={0.3}
        anchorX="right"
        opacity={0.5}
      >
        -X
      </Text>

      {/* Y Axis - Green */}
      <Line
        points={[[0, 0, 0], [0, 0, axisLength]]}
        color="green"
        lineWidth={axisThickness}
      />
      <Text
        position={[0, 0, axisLength + 0.2]}
        color="green"
        fontSize={0.3}
        anchorX="left"
      >
        +Y
      </Text>
      <Line
        points={[[0, 0, 0], [0, 0, -axisLength]]}
        color="green"
        lineWidth={axisThickness}
        opacity={0.5}
      />
      <Text
        position={[0, 0, -axisLength - 0.2]}
        color="green"
        fontSize={0.3}
        anchorX="right"
        opacity={0.5}
      >
        -Y
      </Text>

      {/* Z Axis - Blue */}
      <Line
        points={[[0, 0, 0], [0, axisLength, 0]]}
        color="blue"
        lineWidth={axisThickness}
      />
      <Text
        position={[0, axisLength + 0.2, 0]}
        color="blue"
        fontSize={0.3}
        anchorY="bottom"
      >
        +Z
      </Text>
      <Line
        points={[[0, 0, 0], [0, -axisLength, 0]]}
        color="blue"
        lineWidth={axisThickness}
        opacity={0.5}
      />
      <Text
        position={[0, -axisLength - 0.2, 0]}
        color="blue"
        fontSize={0.3}
        anchorY="top"
        opacity={0.5}
      >
        -Z
      </Text>
    </group>
  );
};