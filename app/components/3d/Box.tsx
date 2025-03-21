import React, { useRef, useEffect, useState, JSX } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { useFrame, useThree } from '@react-three/fiber';

export interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  info?: {
    dimensions: string;
    weight: number;
  };
  shape?: 'box' | 'cylinder' | 'sphere';
}

export function Box({ position, size, color, info, shape = 'box' }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, height, depth] = size;
  const [hovered, setHovered] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);
  
  // Check if this is a global state update
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        setShowAllLabels(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
      <mesh 
        ref={meshRef} 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {shape === 'box' && <boxGeometry args={[width, height, depth]} />}
        {shape === 'cylinder' && (
          <cylinderGeometry args={[width/2, width/2, height, 32]} />
        )}
        {shape === 'sphere' && <sphereGeometry args={[Math.min(width, height, depth)/2, 32, 32]} />}
        
        <meshStandardMaterial 
          color={color} 
          transparent={true} 
          opacity={0.8} 
          roughness={0.3}
          metalness={0.1}
        />
        
        {/* Only add edge lines for boxes */}
        {shape === 'box' && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
            <lineBasicMaterial color="black" />
          </lineSegments>
        )}
      </mesh>
      
      {info && (hovered || showAllLabels) && (
        <Billboard position={[position[0], position[1] + height/2 + 0.15, position[2]]}>
          <group>
            {/* Background plane - changed to white */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial color="white" opacity={0.9} transparent />
            </mesh>
            
            {/* Text - changed to black */}
            <Text
              color="black"
              anchorX="center"
              anchorY="middle"
              fontSize={0.12}
              maxWidth={0.7}
              lineHeight={1.2}
            >
              {`${info.dimensions}\n${info.weight} kg`}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

// Helper component to make text labels face the camera
function Billboard({ children, ...props }: { children: React.ReactNode } & JSX.IntrinsicElements['group']) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  useFrame(() => {
    if (ref.current) {
      ref.current.quaternion.copy(camera.quaternion);
    }
  });
  
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}