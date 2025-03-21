"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useBoxStore } from "@/lib/store";
import { packBoxesInVan, getRotatedDimensions } from "@/lib/binPacking";
import { BoxWithColor } from "@/lib/store";

// Add imports for the Ground component
import { Ground } from "./Ground"; // Keep your original Ground implementation
import { Box } from "./Box";
import { LoadingOverlay } from "../LoadingOverlay";

function WireFrameVan() {
  const van = useBoxStore(state => state.van);
  const width = van.width / 100;
  const height = van.height / 100;
  const depth = van.depth / 100;
  
  // Define a wheel height offset
  const wheelOffset = 0.01; // Adjust this value as needed to move wheels higher
  
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

function BoxesInVan({ boxes }: { boxes: BoxWithColor[] }) {
  const van = useBoxStore(state => state.van);
  
  const boxComponents = useMemo(() => {
    // Use the bin packing algorithm to get optimal positions
    const packedBoxes = packBoxesInVan(boxes, van);
    
    return packedBoxes.map((packedBox, index) => {
      const { box, position, rotation } = packedBox;
      const rotatedDimensions = getRotatedDimensions(box, rotation);
      
      // Convert dimensions to meters for Three.js
      const boxDepth = rotatedDimensions[0] / 100;
      const boxHeight = rotatedDimensions[1] / 100;
      const boxWidth = rotatedDimensions[2] / 100;
      
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
          shape={box.shape || 'box'}
        />
      );
    });
  }, [boxes, van]);
  
  return <>{boxComponents}</>;
}

// Scene component with Suspense for Ground
function Scene({ boxes }: { boxes: BoxWithColor[] }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      
      {/* Use Suspense for the Ground component */}
      <Suspense fallback={null}>
        <Ground />
      </Suspense>
      
      <WireFrameVan />
      <BoxesInVan boxes={boxes} />
      <OrbitControls />
    </>
  );
}

export function VanModel() {
  const boxes = useBoxStore(state => state.boxes);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hide loading screen after a minimum time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="h-[500px] w-full rounded-md border bg-background relative">
      {isLoading && <LoadingOverlay />}
      
      <Canvas shadows>
        <Scene boxes={boxes} />
      </Canvas>
    </div>
  );
}