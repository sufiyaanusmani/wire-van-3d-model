import React, { useRef } from 'react';
import { Box as BoxProps } from '@/lib/store';

interface Props {
  box: BoxProps;
}

export function Box({ box }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { width, height, depth, position, color } = box;
  
  // Convert dimensions from cm to meters for Three.js
  const w = width / 100;
  const h = height / 100;
  const d = depth / 100;
  
  // Convert positions from cm to meters
  const [x, y, z] = position.map(p => p / 100);
  
  return (
    <mesh 
      ref={meshRef} 
      position={[x, y + h/2, z]} // Position box on the floor with y offset for half height
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
      
      {/* Add wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color="black" />
      </lineSegments>
    </mesh>
  );
}