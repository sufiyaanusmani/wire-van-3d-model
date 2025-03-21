import React, { useRef, useEffect, useState, JSX, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { useFrame, useThree } from '@react-three/fiber';

// Update the BoxProps interface
export interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  info?: {
    name?: string;
    dimensions: string;
    weight: number;
  };
  shape?: 'box' | 'cylinder' | 'sphere';
}

export function Box({ position, size, color, info, shape = 'box' }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh & {
    geometry?: {
      boundingBox?: THREE.Box3;
    };
  }>(null);
  const [width, height, depth] = size;
  const [hovered, setHovered] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [textBounds, setTextBounds] = useState({ width: 0.8, height: 0.4 });
  
  // Create a memoized color based on hover state
  const currentColor = useMemo(() => {
    if (!hovered) return color;
    
    // Lighten the color when hovered
    const color3 = new THREE.Color(color);
    color3.lerp(new THREE.Color('white'), 0.3);
    return color3;
  }, [color, hovered]);
  
  // Set up a higher renderOrder for the billboard elements
  const renderOrder = 999;

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
  
  // Calculate the text content to display
  const textContent = useMemo(() => {
    return `${info?.name || ''}\n${info?.dimensions || ''}\n${info?.weight ? `${info.weight} kg` : ''}`;
  }, [info]);
  
  // Update background size when text changes or becomes visible
  useEffect(() => {
    if (textRef.current && (hovered || showAllLabels) && info) {
      // Add a small delay to ensure text has rendered
      const timeoutId = setTimeout(() => {
        if (textRef.current) {
          // Get the computed text bounds with padding
          const bounds = textRef.current.geometry?.boundingBox;
          if (bounds) {
            const padding = 0.1; // Add padding around text
            const width = bounds.max.x - bounds.min.x + padding * 2;
            const height = bounds.max.y - bounds.min.y + padding * 2;
            setTextBounds({ width, height });
          }
        }
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [textContent, hovered, showAllLabels, info]);

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
          color={currentColor} 
          transparent={true} 
          opacity={0.8} 
          roughness={0.3}
          metalness={0.1}
          emissive={hovered ? currentColor : 'black'}
          emissiveIntensity={hovered ? 0.3 : 0}
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
        <Billboard position={[position[0], position[1] + height/2 + 0.25, position[2]]}>
          <group renderOrder={renderOrder}>
            {/* Background outline for better visibility */}
            <mesh position={[0, 0, -0.011]} renderOrder={renderOrder}>
              <planeGeometry args={[textBounds.width + 0.02, textBounds.height + 0.02]} />
              <meshBasicMaterial 
                color="black" 
                opacity={0.7} 
                transparent 
                depthTest={false}
              />
            </mesh>
            
            {/* Background plane - dynamic sizing */}
            <mesh position={[0, 0, -0.01]} renderOrder={renderOrder + 1}>
              <planeGeometry args={[textBounds.width, textBounds.height]} />
              <meshBasicMaterial 
                color="white" 
                opacity={0.95} 
                transparent 
                depthTest={false}
              />
            </mesh>
            
            {/* Text - with ref for measuring */}
            <Text
              ref={textRef}
              color="black"
              anchorX="center"
              anchorY="middle"
              fontSize={0.12}
              maxWidth={0.7}
              lineHeight={1.2}
              renderOrder={renderOrder + 2}
            >
              {textContent}
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