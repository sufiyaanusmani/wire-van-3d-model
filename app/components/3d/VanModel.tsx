"use client";

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useBoxStore } from '@/lib/store';
import { Box } from './Box';
import { BoxData } from '../forms/BoxForm';
import { Ground } from './Ground';

function WireFrameVan() {
  const van = useBoxStore(state => state.van);
  const width = van.width / 100;
  const height = van.height / 100;
  const depth = van.depth / 100;
  
  return (
    <group>
      {/* Cargo area - wireframe */}
      <mesh>
        <boxGeometry args={[depth, height, width]} />
        <meshBasicMaterial color="black" wireframe={true} />
      </mesh>
      
      {/* Van floor */}
      <mesh position={[0, -height/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[depth, width]} />
        <meshBasicMaterial color="#444" side={2} />
      </mesh>
      
      {/* Cabin base */}
      <mesh position={[depth/2 + 0.8, -height/4, 0]}>
        <boxGeometry args={[1.6, height/2, width]} />
        <meshStandardMaterial color="#3a4b5c" />
      </mesh>
      
      {/* Cabin roof - slightly rounded */}
      <mesh position={[depth/2 + 0.8, 0, 0]}>
        <boxGeometry args={[1.6, height/10, width]} />
        <meshStandardMaterial color="#3a4b5c" />
      </mesh>
      
      {/* Windshield - angled */}
      <mesh position={[depth/2 + 1.3, -height/6, 0]} rotation={[0, 0, Math.PI * -0.15]}>
        <boxGeometry args={[0.02, height/2.2, width-0.3]} />
        <meshStandardMaterial color="#a1c7dc" transparent opacity={0.7} />
      </mesh>
      
      {/* Side windows - driver and passenger */}
      <mesh position={[depth/2 + 0.8, -height/6, width/2 + 0.01]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[0.7, height/3]} />
        <meshStandardMaterial color="#a1c7dc" transparent opacity={0.7} side={2} />
      </mesh>
      <mesh position={[depth/2 + 0.8, -height/6, -width/2 - 0.01]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[0.7, height/3]} />
        <meshStandardMaterial color="#a1c7dc" transparent opacity={0.7} side={2} />
      </mesh>
      
      {/* Front grill/radiator */}
      <mesh position={[depth/2 + 1.8, -height/3, 0]}>
        <boxGeometry args={[0.1, height/5, width-0.3]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      {/* Hood - sloped */}
      <mesh position={[depth/2 + 1.55, -height/3 + 0.15, 0]} rotation={[0, 0, Math.PI * 0.03]}>
        <boxGeometry args={[0.4, 0.05, width-0.2]} />
        <meshStandardMaterial color="#3a4b5c" />
      </mesh>
      
      {/* Front bumper with detail */}
      <mesh position={[depth/2 + 1.88, -height/2 + 0.15, 0]}>
        <boxGeometry args={[0.12, 0.3, width]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Bumper back */}
      <mesh position={[-depth/2 - 0.05, -height/2 + 0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, width+0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Headlights - rectangular */}
      <mesh position={[depth/2 + 1.85, -height/3, width/2-0.3]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#f7f9d0" emissive="#f7f9d0" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[depth/2 + 1.85, -height/3, -width/2+0.3]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#f7f9d0" emissive="#f7f9d0" emissiveIntensity={0.5} />
      </mesh>
      
      {/* License plate */}
      <mesh position={[depth/2 + 1.89, -height/2 + 0.35, 0]}>
        <boxGeometry args={[0.01, 0.12, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[depth/2 + 1.2, -height/4, width/2 + 0.15]}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[depth/2 + 1.2, -height/4, -width/2 - 0.15]}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Wheels - Front */}
      <mesh position={[depth/3, -height/2, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[depth/3, -height/2, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Wheels - Middle */}
      <mesh position={[0, -height/2, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -height/2, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Wheels - Back */}
      <mesh position={[-depth/3, -height/2, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-depth/3, -height/2, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Add tires/wheel caps for more detail */}
      {[
        [depth/3, width/2],
        [depth/3, -width/2],
        [0, width/2],
        [0, -width/2],
        [-depth/3, width/2],
        [-depth/3, -width/2]
      ].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], -height/2, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.21, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

function BoxesInVan({ boxes }: { boxes: BoxData[] }) {
  const van = useBoxStore(state => state.van);
  const vanDepth = van.depth / 100;
  const vanWidth = van.width / 100;
  const vanHeight = van.height / 100;
  
  const boxComponents = useMemo(() => {
    let x = -vanDepth / 2 + 0.1;
    let y = -vanHeight / 2 + 0.1;
    let z = -vanWidth / 2 + 0.1;
    let maxHeightInRow = 0;
    
    return boxes.map((box, index) => {
      const boxDepth = box.length / 100;
      const boxWidth = box.width / 100;
      const boxHeight = box.height / 100;
      
      if (x + boxDepth > vanDepth / 2) {
        x = -vanDepth / 2 + 0.1;
        z += maxHeightInRow + 0.1;
        maxHeightInRow = 0;
      }
      
      if (z + boxWidth > vanWidth / 2) {
        x = -vanDepth / 2 + 0.1;
        z = -vanWidth / 2 + 0.1;
        y += maxHeightInRow + 0.1;
        maxHeightInRow = 0;
      }
      
      const position: [number, number, number] = [
        x + boxDepth / 2,
        y + boxHeight / 2, 
        z + boxWidth / 2
      ];
      
      x += boxDepth + 0.1;
      maxHeightInRow = Math.max(maxHeightInRow, boxHeight);
      
      return (
        <Box
          key={index}
          position={position}
          size={[boxDepth, boxHeight, boxWidth]}
          color={box.color || `hsl(${(index * 137) % 360}, 100%, 50%)`}
          info={{
            dimensions: `${box.length}×${box.width}×${box.height}`,
            weight: box.weight
          }}
        />
      );
    });
  }, [boxes, vanDepth, vanWidth, vanHeight]);
  
  return <>{boxComponents}</>;
}

export function VanModel() {
  const boxes = useBoxStore(state => state.boxes);
  
  return (
    <div className="h-[500px] w-full rounded-md border bg-background">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <Ground />
        <WireFrameVan />
        <BoxesInVan boxes={boxes} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}