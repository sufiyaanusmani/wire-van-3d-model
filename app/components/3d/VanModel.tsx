"use client";

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useBoxStore } from '@/lib/store';
import { Box } from './Box';
import { BoxData } from '../forms/BoxForm';

function WireFrameVan() {
  const van = useBoxStore(state => state.van);
  const width = van.width / 100;
  const height = van.height / 100;
  const depth = van.depth / 100;
  
  return (
    <group>
      <mesh position={[0, -height/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[depth, width]} />
        <meshBasicMaterial color="#444" side={2} />
      </mesh>
      <mesh>
        <boxGeometry args={[depth, height, width]} />
        <meshBasicMaterial color="black" wireframe={true} />
      </mesh>
      <mesh position={[depth/3, -height/2, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-depth/3, -height/2, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[depth/3, -height/2, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-depth/3, -height/2, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
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
        <WireFrameVan />
        <BoxesInVan boxes={boxes} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}