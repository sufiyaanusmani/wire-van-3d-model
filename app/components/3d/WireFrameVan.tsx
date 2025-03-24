"use client";

import { useBoxStore } from "@/lib/store";
import { useMemo } from "react";
import * as THREE from 'three';

export function WireFrameVan() {
    const van = useBoxStore(state => state.van);
    const width = van.width / 100;
    const height = van.height / 100;
    const depth = van.depth / 100;
    
    // Define a wheel height offset
    const wheelOffset = 0.01;
    const wheelOutwardOffset = 0.08;  // Add this constant after wheelOffset
    
    // Tire material with texture
    const tireMaterial = useMemo(() => {
      // Create radial tread pattern for tires
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.fillStyle = '#222';
        context.fillRect(0, 0, 64, 64);
        
        // Add tire treads
        context.fillStyle = '#111';
        
        // Horizontal treads
        for (let i = 0; i < 8; i++) {
          context.fillRect(0, i * 8 + 2, 64, 3);
        }
        
        // Radial treads
        context.translate(32, 32);
        for (let i = 0; i < 12; i++) {
          context.rotate(Math.PI / 6);
          context.fillRect(-32, -1, 64, 2);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 1);
      
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0,
        color: '#333'
      });
    }, []);
    
    // Rim material
    const rimMaterial = useMemo(() => {
      return new THREE.MeshStandardMaterial({
        color: '#DDD',
        roughness: 0.2,
        metalness: 0.8,
        envMapIntensity: 1
      });
    }, []);
  
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
        
        {/* REALISTIC CABIN */}
        <group position={[depth/2, 0, 0]}>
          {/* Main cabin body - with curved corners using multiple meshes */}
          <mesh position={[0.8, -height/4, 0]}>
            <boxGeometry args={[1.5, height/2, width * 0.95]} />
            <meshStandardMaterial color="#2A3747" roughness={0.6} metalness={0.2} />
          </mesh>
          
          {/* Front of cabin - with slope for aerodynamics */}
          <mesh position={[1.45, -height/4, 0]} rotation={[0, 0, Math.PI * 0.1]}>
            <boxGeometry args={[0.4, height/2.2, width * 0.92]} />
            <meshStandardMaterial color="#2A3747" roughness={0.6} metalness={0.2} />
          </mesh>
          
          {/* Hood with detailed shape */}
          <mesh position={[1.6, -height/3 + 0.1, 0]}>
            <boxGeometry args={[0.4, 0.08, width * 0.9]} />
            <meshStandardMaterial color="#2A3747" roughness={0.5} metalness={0.2} />
          </mesh>
          
          {/* Cabin roof - with slight curvature */}
          <mesh position={[0.77, height/4 + 0.3, 0]}>
            <boxGeometry args={[1.38, 0.08, width * 0.94]} />
            <meshStandardMaterial color="#2A3747" roughness={0.5} metalness={0.2} />
          </mesh>
          
          {/* Windshield - realistic angle and proper glass material */}
          <mesh position={[1.5, 0.02, 0]} rotation={[0, 0, Math.PI * 0.03]}>
            <boxGeometry args={[0.04, height/1.2, width * 0.88]} />
            <meshPhysicalMaterial 
              color="#a7c4e2" 
              transparent 
              opacity={0.7} 
              metalness={0.5} 
              roughness={0.1} 
              clearcoat={1} 
              clearcoatRoughness={0.1}
              reflectivity={0.8}
            />
          </mesh>
          
          {/* Back window of cabin (connecting to cargo) */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.03, height/1.2, width * 0.88]} />
            <meshPhysicalMaterial 
              color="#a7c4e2" 
              transparent 
              opacity={0.7} 
              metalness={0.5} 
              roughness={0.1} 
              clearcoat={1} 
              clearcoatRoughness={0.1}
            />
          </mesh>
          
          {/* Window frames - black trim */}
          <mesh position={[1.2, 0.02, 0]} rotation={[0, 0, Math.PI * -0.13]} scale={[1.1, 1.05, 1.05]}>
            <boxGeometry args={[0.015, height/2.3, width * 0.88]} />
            <meshStandardMaterial color="black" />
          </mesh>
          
          <mesh position={[0.1, 0, 0]} scale={[1.1, 1.05, 1.05]}>
            <boxGeometry args={[0.015, height/2.5, width * 0.88]} />
            <meshStandardMaterial color="black" />
          </mesh>        
          
          {/* NEW: Side windows with frames */}
          <group position={[0.85, -height/8, width/2 * 0.95]}>
            {/* Side window glass */}
            <mesh>
              <boxGeometry args={[1.2, height/3, 0.03]} />
              <meshPhysicalMaterial 
                color="#a7c4e2" 
                transparent 
                opacity={0.6} 
                metalness={0.5} 
                roughness={0.1} 
                clearcoat={1} 
              />
            </mesh>
            
            {/* Window frame */}
            <mesh scale={[1.05, 1.05, 1.5]}>
              <boxGeometry args={[1.2, height/3, 0.01]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </group>
          
          <group position={[0.85, -height/8, -width/2 * 0.95]}>
            {/* Side window glass */}
            <mesh>
              <boxGeometry args={[1.2, height/3, 0.03]} />
              <meshPhysicalMaterial 
                color="#a7c4e2" 
                transparent 
                opacity={0.6} 
                metalness={0.5} 
                roughness={0.1} 
                clearcoat={1} 
              />
            </mesh>
            
            {/* Window frame */}
            <mesh scale={[1.05, 1.05, 1.5]}>
              <boxGeometry args={[1.2, height/3, 0.01]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </group>
          
          {/* Bumper detail - lower accent */}
          <mesh position={[1.83, -height/2 + 0.05, 0]}>
            <boxGeometry args={[0.175, 0.05, width * 0.98]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
          
          {/* NEW: Grille with more details */}
          <mesh position={[1.82, -height/3, 0]}>
            <boxGeometry args={[0.01, 0.25, width * 0.65]} />
            <meshStandardMaterial color="#111" metalness={0.5} roughness={0.2} />
          </mesh>
          
          {/* Grille horizontal slats */}
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[1.82, -height/3 - 0.1 + i * 0.05, 0]}>
              <boxGeometry args={[0.015, 0.015, width * 0.62]} />
              <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          
          {/* Brand logo on grille */}
          <mesh position={[1.83, -height/3, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
            <meshStandardMaterial color="#DDD" metalness={0.9} roughness={0.1} />
          </mesh>
          
          {/* Modern headlights - with complex shape */}
          <group position={[1.75, -height/3 - 0.05, width/2 * 0.75]}>
            {/* Main headlight */}
            <mesh>
              <boxGeometry args={[0.08, 0.15, 0.3]} />
              <meshPhysicalMaterial 
                color="#f5f5f5" 
                emissive="#f3f3d9" 
                emissiveIntensity={0.3}
                transparent
                opacity={0.9}
                clearcoat={1}
              />
            </mesh>
            
            {/* Headlight glass cover */}
            <mesh position={[0.04, 0, 0]}>
              <boxGeometry args={[0.01, 0.17, 0.32]} />
              <meshPhysicalMaterial 
                color="#ffffff" 
                clearcoat={1}
                transparent
                opacity={0.8}
                metalness={0.5}
                roughness={0}
              />
            </mesh>
            
            {/* NEW: LED daytime running lights */}
            <mesh position={[0.02, -0.12, 0]}>
              <boxGeometry args={[0.03, 0.03, 0.28]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
          
          <group position={[1.75, -height/3 - 0.05, -width/2 * 0.75]}>
            <mesh>
              <boxGeometry args={[0.08, 0.15, 0.3]} />
              <meshPhysicalMaterial 
                color="#f5f5f5" 
                emissive="#f3f3d9" 
                emissiveIntensity={0.3}
                transparent
                opacity={0.9}
                clearcoat={1}
              />
            </mesh>
            
            <mesh position={[0.04, 0, 0]}>
              <boxGeometry args={[0.01, 0.17, 0.32]} />
              <meshPhysicalMaterial 
                color="#ffffff" 
                clearcoat={1}
                transparent
                opacity={0.8}
                metalness={0.5}
                roughness={0}
              />
            </mesh>
            
            {/* NEW: LED daytime running lights */}
            <mesh position={[0.02, -0.12, 0]}>
              <boxGeometry args={[0.03, 0.03, 0.28]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
          
          {/* Fog lights - recessed in bumper */}
          <mesh position={[1.89, -height/2 + 0.17, width/3]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
            <meshStandardMaterial color="#f7f9d0" emissive="#f7f9d0" emissiveIntensity={0.2} />
          </mesh>
          
          <mesh position={[1.89, -height/2 + 0.17, -width/3]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
            <meshStandardMaterial color="#f7f9d0" emissive="#f7f9d0" emissiveIntensity={0.2} />
          </mesh>
          
          {/* Realistic side mirrors */}
          <group position={[1.3, -height/15, width/2 * 0.95 + 0.15]}>
            {/* Mirror arm - with proper perspective */}
            <mesh position={[-0.05, 0, 0]} rotation={[0, -Math.PI/8, 0]}>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshStandardMaterial color="#2A3747" />
            </mesh>
            
            {/* Mirror housing */}
            <mesh position={[0, 0, 0.08]} rotation={[0, Math.PI/6, 0]}>
              <boxGeometry args={[0.05, 0.18, 0.12]} />
              <meshStandardMaterial color="#2A3747" roughness={0.5} />
            </mesh>
            
            {/* Mirror glass */}
            <mesh position={[0.01, 0, 0.08]} rotation={[0, Math.PI/6, 0]}>
              <boxGeometry args={[0.01, 0.15, 0.09]} />
              <meshPhysicalMaterial 
                color="#a7c4e2" 
                metalness={0.9} 
                roughness={0} 
                clearcoat={1}
                reflectivity={1}
              />
            </mesh>
          </group>
          
          <group position={[1.3, -height/15, -width/2 * 0.95 - 0.15]}>
            <mesh position={[-0.05, 0, 0]} rotation={[0, Math.PI/8, 0]}>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshStandardMaterial color="#2A3747" />
            </mesh>
            
            <mesh position={[0, 0, -0.08]} rotation={[0, -Math.PI/6, 0]}>
              <boxGeometry args={[0.05, 0.18, 0.12]} />
              <meshStandardMaterial color="#2A3747" roughness={0.5} />
            </mesh>
            
            <mesh position={[0.01, 0, -0.08]} rotation={[0, -Math.PI/6, 0]}>
              <boxGeometry args={[0.01, 0.15, 0.09]} />
              <meshPhysicalMaterial 
                color="#a7c4e2" 
                metalness={0.9} 
                roughness={0} 
                clearcoat={1}
                reflectivity={1}
              />
            </mesh>
          </group>
          
          {/* NEW: Interior dashboard */}
          <mesh position={[1.1, -height/6, 0]} rotation={[0, 0, -Math.PI * 0.1]}>
            <boxGeometry args={[0.4, 0.18, width * 0.8]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
          
          {/* Steering wheel */}
          <group position={[1.1, -height/6 - 0.05, -width/6]} rotation={[0, 0, -Math.PI * 0.3]}>
            <mesh>
              <torusGeometry args={[0.15, 0.02, 16, 32]} />
              <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
            
            {/* Steering wheel center */}
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          </group>
          
          {/* Center console screen */}
          <mesh position={[1.1, -height/6 + 0.05, 0]} rotation={[Math.PI/2 * 0.9, 0, 0]}>
            <planeGeometry args={[0.25, 0.15]} />
            <meshStandardMaterial color="#111" emissive="#114477" emissiveIntensity={0.2} />
          </mesh>
          
          {/* Windshield wipers */}
          <group position={[1.55, -height/10, 0]}>
            <mesh rotation={[0, 0, Math.PI * 0.1]}>
              <boxGeometry args={[0.5, 0.01, 0.01]} />
              <meshStandardMaterial color="black" />
            </mesh>
            
            <mesh position={[-0.18, 0, width/4]} rotation={[0, 0, Math.PI * 0.2]}>
              <boxGeometry args={[0.4, 0.01, 0.01]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </group>
          
          {/* Door handles */}
          <mesh position={[0.85, -height/4, width/2 * 0.96]} rotation={[0, -Math.PI/2, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.02]} />
            <meshStandardMaterial color="#CCC" metalness={0.7} roughness={0.3} />
          </mesh>
          
          <mesh position={[0.85, -height/4, -width/2 * 0.96]} rotation={[0, Math.PI/2, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.02]} />
            <meshStandardMaterial color="#CCC" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* License plate */}
          <mesh position={[1.92, -height/3 - 0.05, 0]}>
            <boxGeometry args={[0.01, 0.1, 0.3]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
        
        {/* Enhanced Wheels - with outward offset */}
        {[
          [depth/3, width/2 + wheelOutwardOffset],                // Front right
          [depth/3, -width/2 - wheelOutwardOffset],               // Front left
          [0, width/2 + wheelOutwardOffset],                      // Middle right
          [0, -width/2 - wheelOutwardOffset],                     // Middle left
          [-depth/3, width/2 + wheelOutwardOffset],               // Back right
          [-depth/3, -width/2 - wheelOutwardOffset],              // Back left
          [depth/2 + 1.1, width/2 + wheelOutwardOffset],          // Cabin right
          [depth/2 + 1.1, -width/2 - wheelOutwardOffset]          // Cabin left
        ].map((pos, idx) => (
          <group key={idx} position={[pos[0], -height/2 + wheelOffset, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
            {/* Tire */}
            <mesh castShadow receiveShadow material={tireMaterial}>
              <cylinderGeometry args={[0.31, 0.31, 0.2, 32]} />
            </mesh>
            
            {/* Rim/hub */}
            <mesh position={[0, 0, 0.015]} material={rimMaterial}>
              <cylinderGeometry args={[0.16, 0.16, 0.24, 8]} />
            </mesh>
            
            {/* Hub cap */}
            <mesh position={[0, 0, 0.11]} material={rimMaterial}>
              <circleGeometry args={[0.09, 16]} />
            </mesh>
            
            {/* Hub details - lug nuts */}
            {[...Array(5)].map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i * Math.PI * 2 / 5) * 0.11, 
                  Math.cos(i * Math.PI * 2 / 5) * 0.11, 
                  0.115
                ]}
              >
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
        
        {/* Remove the old wheels and wheel caps as they're replaced by the new enhanced wheels */}
      </group>
    );
  }