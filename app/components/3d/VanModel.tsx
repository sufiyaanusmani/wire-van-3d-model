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
  
  // Define a wheel height offset
  const wheelOffset = 0.11; // Adjust this value as needed to move wheels higher
  
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
      
      {/* Wheels - Front - moved up by wheelOffset */}
      <mesh position={[depth/3, -height/2 + wheelOffset, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[depth/3, -height/2 + wheelOffset, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Wheels - Middle - moved up by wheelOffset */}
      <mesh position={[0, -height/2 + wheelOffset, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -height/2 + wheelOffset, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Wheels - Back - moved up by wheelOffset */}
      <mesh position={[-depth/3, -height/2 + wheelOffset, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-depth/3, -height/2 + wheelOffset, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Cabin wheels - moved up by wheelOffset */}
      <mesh position={[depth/2 + 1.1, -height/2 + wheelOffset, width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[depth/2 + 1.1, -height/2 + wheelOffset, -width/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Add tires/wheel caps for more detail - moved up by wheelOffset */}
      {[
        [depth/2 + 1.1, width/2],  // new cabin wheel - right side
        [depth/2 + 1.1, -width/2], // new cabin wheel - left side
        [depth/3, width/2],
        [depth/3, -width/2],
        [0, width/2],
        [0, -width/2],
        [-depth/3, width/2],
        [-depth/3, -width/2]
      ].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], -height/2 + wheelOffset, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
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
    const placedBoxes: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    }[] = [];
    
    // Function to check if a new box would overlap with any existing boxes
    const checkOverlap = (newBox: typeof placedBoxes[0]) => {
      return placedBoxes.some(box => {
        // Check for overlap in all three dimensions
        const overlapX = 
          newBox.x < box.x + box.depth && 
          newBox.x + newBox.depth > box.x;
        
        const overlapY = 
          newBox.y < box.y + box.height && 
          newBox.y + newBox.height > box.y;
        
        const overlapZ = 
          newBox.z < box.z + box.width && 
          newBox.z + newBox.width > box.z;
        
        return overlapX && overlapY && overlapZ;
      });
    };
    
    // Function to find a valid position for a new box
    const findValidPosition = (boxDepth: number, boxHeight: number, boxWidth: number) => {
      // Start at the bottom of the van
      let y = -vanHeight / 2 + 0.1;
      
      while (y + boxHeight <= vanHeight / 2) {
        // Try positions across the floor
        for (let z = -vanWidth / 2 + 0.1; z + boxWidth <= vanWidth / 2; z += 0.1) {
          for (let x = -vanDepth / 2 + 0.1; x + boxDepth <= vanDepth / 2; x += 0.1) {
            const newBox = {
              x,
              y,
              z,
              width: boxWidth,
              height: boxHeight,
              depth: boxDepth
            };
            
            if (!checkOverlap(newBox)) {
              return { x, y, z };
            }
          }
        }
        
        // If no position found on this level, try the next level up
        y += 0.1;
      }
      
      // If no valid position is found inside the van
      return null;
    };
    
    return boxes.map((box, index) => {
      const boxDepth = box.length / 100;
      const boxWidth = box.width / 100;
      const boxHeight = box.height / 100;
      
      // Find a valid position for this box
      const validPosition = findValidPosition(boxDepth, boxHeight, boxWidth);
      
      // If no valid position is found, return null (box won't be rendered)
      if (!validPosition) {
        return null;
      }
      
      const { x, y, z } = validPosition;
      
      // Add this box to the list of placed boxes
      placedBoxes.push({
        x,
        y,
        z,
        width: boxWidth,
        height: boxHeight,
        depth: boxDepth
      });
      
      const position: [number, number, number] = [
        x + boxDepth / 2,
        y + boxHeight / 2,
        z + boxWidth / 2
      ];
      
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
    }).filter(Boolean); // Filter out null values for boxes that couldn't be placed
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