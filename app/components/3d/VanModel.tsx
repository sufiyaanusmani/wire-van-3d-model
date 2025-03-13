"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import { BoxData } from "@/app/components/box-form";
import { useBoxStore } from "@/lib/store";
import { useMemo } from "react";

function WireFrameVan() {
  const van = useBoxStore(state => state.van);
  const width = van.width / 100;
  const height = van.height / 100;
  const depth = van.depth / 100;
  
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -height/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[depth, width]} />
        <meshBasicMaterial color="#444" side={2} />
      </mesh>
      
      {/* Wireframe structure */}
      <mesh>
        <boxGeometry args={[depth, height, width]} />
        <meshBasicMaterial color="black" wireframe={true} />
      </mesh>
      
      {/* Simple wheels */}
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

function Box({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
      <meshStandardMaterial wireframe color="black" />
    </mesh>
  );
}

function BoxesInVan({ boxes }: { boxes: BoxData[] }) {
  const van = useBoxStore(state => state.van);
  const vanDepth = van.depth / 100;
  const vanWidth = van.width / 100;
  const vanHeight = van.height / 100;
  
  // Generate box positions with a simple packing algorithm
  const boxComponents = useMemo(() => {
    let x = -vanDepth/2 + 0.1;
    let y = -vanHeight/2 + 0.1;
    let z = -vanWidth/2 + 0.1;
    let maxHeightInRow = 0;
    
    return boxes.map((box, index) => {
      const boxDepth = box.length / 100;
      const boxWidth = box.width / 100;
      const boxHeight = box.height / 100;
      
      // Check if box fits in current row
      if (x + boxDepth > vanDepth/2) {
        x = -vanDepth/2 + 0.1;
        z += maxHeightInRow + 0.1;
        maxHeightInRow = 0;
      }
      
      // Check if we need to start a new layer
      if (z + boxWidth > vanWidth/2) {
        x = -vanDepth/2 + 0.1;
        z = -vanWidth/2 + 0.1;
        y += maxHeightInRow + 0.1;
        maxHeightInRow = 0;
      }
      
      const position: [number, number, number] = [
        x + boxDepth/2,
        y + boxHeight/2, 
        z + boxWidth/2
      ];
      
      // Update position for next box
      x += boxDepth + 0.1;
      maxHeightInRow = Math.max(maxHeightInRow, boxHeight);
      
      // Generate a random but consistent color for each box
      const hue = (index * 137) % 360;
      const color = `hsl(${hue}, 70%, 60%)`;
      
      return (
        <Box 
          key={index}
          position={position}
          size={[boxDepth, boxHeight, boxWidth]}
          color={color}
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
        <Grid infiniteGrid fadeDistance={30} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <div className="p-2 text-center text-sm text-muted-foreground">
        Drag to rotate | Scroll to zoom | Right-click to pan
      </div>
    </div>
  );
}