import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';

export interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  info?: {
    dimensions: string;
    weight: number;
  };
}

export function Box({ position, size, color, info }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, height, depth] = size;
  
  // Add subtle animation when boxes are added
  useEffect(() => {
    if (meshRef.current) {
      // Start slightly above final position and "drop" into place
      const origY = position[1];
      const startY = origY + 0.5;
      
      meshRef.current.position.y = startY;
      
      const animation = gsap.to(meshRef.current.position, {
        y: origY,
        duration: 0.5,
        ease: "bounce.out",
      });
      
      return () => {
        animation.kill();
      };
    }
  }, [position]);
  
  return (
    <group>
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
      
      {info && (
        <Text
          position={[position[0], position[1] + height/2 + 0.05, position[2]]}
          color="black"
          anchorX="center"
          anchorY="bottom"
          fontSize={0.1}
          maxWidth={0.5}
          lineHeight={1.2}
        >
          {`${info.dimensions}\n${info.weight} kg`}
        </Text>
      )}
    </group>
  );
}