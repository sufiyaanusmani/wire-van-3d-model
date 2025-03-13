import React, { useRef } from 'react';
import * as THREE from 'three';

export interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export function Box({ position, size, color }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, height, depth] = size;
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color={color} 
        transparent={true} 
        opacity={0.8} 
        roughness={0.3}
        metalness={0.1}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="black" />
      </lineSegments>
    </mesh>
  );
}