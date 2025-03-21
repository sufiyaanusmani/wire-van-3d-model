"use client";

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

export function Ground() {
  // Load floor textures - keep your original implementation that renders textures correctly
  const [gravelBaseColor, gravelNormalMap, gravelRoughnessMap] = useTexture([
    '/textures/Gravel040_1K-JPG_Color.jpg',
    '/textures/Gravel040_1K-JPG_NormalGL.jpg',
    '/textures/Gravel040_1K-JPG_Roughness.jpg'
  ]);
  
  // Configure floor textures
  [gravelBaseColor, gravelNormalMap, gravelRoughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
  });
  
  // Load wall textures
  const [wallBaseColor, wallNormalMap, wallRoughnessMap] = useTexture([
    '/textures/Planks021_1K-JPG_Color.jpg',
    '/textures/Planks021_1K-JPG_NormalGL.jpg',
    '/textures/Planks021_1K-JPG_Roughness.jpg'
  ]);
  
  // Configure wall textures
  [wallBaseColor, wallNormalMap, wallRoughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
  });
  
  // Load additional textures separately
  const [cardboardTexture] = useTexture(['/textures/Paper005_1K-JPG_Color.jpg']);
  cardboardTexture.wrapS = cardboardTexture.wrapT = THREE.RepeatWrapping;
  
  const [metalTexture] = useTexture(['/textures/Metal055A_1K-JPG_Color.jpg']);
  metalTexture.wrapS = metalTexture.wrapT = THREE.RepeatWrapping;
  
  const [logoTexture] = useTexture(['/logo.png']);
  logoTexture.wrapS = logoTexture.wrapT = THREE.ClampToEdgeWrapping;
  
  // Create warning sign texture
  const cautionSignTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CAUTION', 64, 50);
      ctx.fillText('FORKLIFT', 64, 80);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create clipboard texture
  const clipboardTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 64, 80);
      ctx.fillStyle = '#000';
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(10, 10 + i * 6, 44, 1);
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create safety lines texture
  const safetyLinesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);
      
      // Draw dashed yellow lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 15;
      ctx.setLineDash([20, 20]);
      
      // Border lines
      ctx.beginPath();
      ctx.rect(30, 30, 452, 452);
      ctx.stroke();
      
      // Central cross lines
      ctx.beginPath();
      ctx.moveTo(256, 30);
      ctx.lineTo(256, 482);
      ctx.moveTo(30, 256);
      ctx.lineTo(482, 256);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);
  
  return (
    <group>
      {/* Enhanced gravel ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          map={gravelBaseColor}
          normalMap={gravelNormalMap}
          roughnessMap={gravelRoughnessMap}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Subtle grid lines */}
      <gridHelper 
        args={[30, 30, "#555555", "#777777"]} 
        position={[0, -1.19, 0]}
      />
      
      {/* Back wall with texture */}
      <mesh position={[0, 3, -15]} castShadow receiveShadow>
        <boxGeometry args={[30, 8, 0.5]} />
        <meshStandardMaterial 
          map={wallBaseColor}
          normalMap={wallNormalMap}
          roughnessMap={wallRoughnessMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Side wall left with texture */}
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 8, 0.5]} />
        <meshStandardMaterial 
          map={wallBaseColor}
          normalMap={wallNormalMap}
          roughnessMap={wallRoughnessMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Loading dock platform */}
      <mesh position={[0, -1, -10]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.4, 5]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      
      {/* Warehouse ceiling */}
      <mesh position={[0, 7, 0]} receiveShadow>
        <boxGeometry args={[30, 0.5, 30]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {/* Warehouse ceiling lights (emit light) */}
      {[[-8, 0], [0, 0], [8, 0]].map((pos, i) => (
        <group key={i} position={[pos[0], 6.75, pos[1]]}>
          <mesh>
            <boxGeometry args={[4, 0.2, 4]} />
            <meshStandardMaterial color="#f8f8f8" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
          <pointLight position={[0, -1, 0]} intensity={5} distance={15} decay={2} />
        </group>
      ))}
      
      {/* Warehouse shelving */}
      <mesh position={[-12, 1, -12]} castShadow>
        <boxGeometry args={[5, 4, 2]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Pallets */}
      {[[-8, -8], [-7, 5], [10, -3]].map((pos, i) => (
        <mesh key={`pallet-${i}`} position={[pos[0], -0.9, pos[1]]} castShadow>
          <boxGeometry args={[1.2, 0.15, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* Some scattered small boxes */}
      {[[-8, -8], [-7.2, 5], [10.3, -3]].map((pos, i) => (
        <mesh key={`smallbox-${i}`} position={[pos[0], -0.8, pos[1]]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.5]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      ))}
      
      {/* Loading dock ramp */}
      <mesh position={[0, -1.15, -7.5]} rotation={[-Math.PI / 16, 0, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
      
      {/* Yellow safety lines on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent={true}
          opacity={0.6}
          alphaMap={safetyLinesTexture}
        />
      </mesh>

      {/* --- ADDITIONAL WAREHOUSE ELEMENTS --- */}
      
      {/* Loading dock roll-up door */}
      <mesh position={[5, 2, -14.7]} castShadow receiveShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color="#777" roughness={0.8} metalness={0.6} />
        
        {/* Door tracks */}
        <mesh position={[-4, 0, 0.2]} castShadow>
          <boxGeometry args={[0.1, 6, 0.1]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
        <mesh position={[4, 0, 0.2]} castShadow>
          <boxGeometry args={[0.1, 6, 0.1]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      </mesh>
      
      {/* Industrial shelving with items */}
      <group position={[-12, 0, -12]}>
        {/* Metal frame */}
        <mesh castShadow>
          <boxGeometry args={[5, 4, 0.1]} />
          <meshStandardMaterial map={metalTexture} color="#444" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Shelves */}
        {[0.5, 1.5, 2.5, 3.5].map((y, i) => (
          <mesh key={`shelf-${i}`} position={[0, y, 0.6]} castShadow>
            <boxGeometry args={[5, 0.05, 1.2]} />
            <meshStandardMaterial map={metalTexture} color="#555" />
          </mesh>
        ))}
        
        {/* Items on shelves */}
        <group position={[-1.5, 0.8, 0.6]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.6, 0.8]} />
            <meshStandardMaterial map={cardboardTexture} />
          </mesh>
        </group>
        <group position={[1.2, 1.8, 0.6]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.4, 0.7]} />
            <meshStandardMaterial map={cardboardTexture} color="#d4b285" />
          </mesh>
        </group>
        <group position={[0, 2.8, 0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
            <meshStandardMaterial color="#3a7d44" roughness={0.8} />
          </mesh>
        </group>
      </group>
      
      {/* Stacked cardboard boxes */}
      <group position={[12, 0, -12]}>
        {/* Bottom layer */}
        {[[0, 0], [1.1, 0], [0, 1.1], [1.1, 1.1]].map((pos, i) => (
          <mesh key={`box-b-${i}`} position={[pos[0], 0.5, pos[1]]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial map={cardboardTexture} color={i % 2 === 0 ? "#d4b285" : "#c19a6b"} />
          </mesh>
        ))}
        
        {/* Middle layer */}
        <mesh position={[0.55, 1.5, 0.55]} castShadow>
          <boxGeometry args={[2.2, 1, 2.2]} />
          <meshStandardMaterial map={cardboardTexture} color="#d4b285" />
        </mesh>
        
        {/* Top box */}
        <mesh position={[0.55, 2.5, 0.55]} castShadow>
          <boxGeometry args={[1.3, 1, 1.3]} />
          <meshStandardMaterial map={cardboardTexture} color="#c19a6b" />
        </mesh>
      </group>
      
      {/* Forklift (simplified) */}
      <group position={[8, -0.9, 5]} rotation={[0, Math.PI / 4, 0]}>
        {/* Base/body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.8, 1.2, 3]} />
          <meshStandardMaterial color="#f9a826" roughness={0.8} />
        </mesh>
        
        {/* Forks */}
        <mesh position={[-1.2, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.1, 2.2]} />
          <meshStandardMaterial color="#777" metalness={0.6} />
        </mesh>
        <mesh position={[-1.2, 0.2, -0.8]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#777" metalness={0.6} />
        </mesh>
        <mesh position={[-1.2, 0.2, 0.8]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#777" metalness={0.6} />
        </mesh>
        
        {/* Overhead protection */}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 2.5]} />
          <meshStandardMaterial color="#777" metalness={0.4} />
        </mesh>
        {[0.7, -0.7].map((z, i) => (
          <mesh key={`post-${i}`} position={[0.7, 1.5, z]} castShadow>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#777" metalness={0.4} />
          </mesh>
        ))}
        
        {/* Wheels */}
        {[[-0.5, -1], [-0.5, 1], [0.5, -1], [0.5, 1]].map((pos, i) => (
          <mesh key={`wheel-${i}`} position={[pos[0], 0, pos[1]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))}
      </group>
      
      {/* Safety elements */}
      {/* Safety bollards */}
      {[[-8, -5], [-5, -8], [8, -5], [5, -8]].map((pos, i) => (
        <group key={`bollard-${i}`} position={[pos[0], 0, pos[1]]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 1, 16]} />
            <meshStandardMaterial color="#f9a826" roughness={0.8} />
          </mesh>
          {/* Reflective stripes */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
      
      {/* Warning signs (FIXED) */}
      <mesh position={[-14.7, 3, -5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#ffcc00" 
          emissive="#ffcc00" 
          emissiveIntensity={0.2}
          map={cautionSignTexture} 
        />
      </mesh>
      
      {/* Fire extinguisher */}
      <group position={[-14.7, 1.5, -8]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshStandardMaterial color="#ff0000" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      
      {/* Wrapped pallet */}
      <group position={[-5, 0, 8]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[1.2, 0.15, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[1, 1.2, 0.7]} />
          <meshStandardMaterial color="#eeeeee" transparent opacity={0.7} />
        </mesh>
      </group>
      
      {/* Control panel/clipboard on wall (FIXED) */}
      <group position={[-14.7, 1.7, 5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0, 0.03]} castShadow>
          <planeGeometry args={[0.35, 0.45]} />
          <meshStandardMaterial 
            color="#ffffff"
            map={clipboardTexture}
          />
        </mesh>
      </group>
      
      {/* Enhanced lighting */}
      {/* Wall lights */}
      {[[-10, 4], [0, 4], [10, 4]].map((pos, i) => (
        <group key={`wall-light-${i}`} position={[pos[0], 4, -14.6]}>
          <mesh castShadow>
            <boxGeometry args={[1, 0.3, 0.2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, -0.1, 0.1]} castShadow>
            <boxGeometry args={[0.8, 0.1, 0.1]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
          </mesh>
          <spotLight 
            position={[0, 0, 1]} 
            angle={0.6} 
            intensity={8} 
            distance={25} 
            decay={2}
            penumbra={0.2}
            target-position={[pos[0], 0, 0]}
          />
        </group>
      ))}

      {/* Company Logo on the back wall */}
      <mesh position={[-5, 4, -14.7]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial 
          map={logoTexture}
          transparent={true}
          side={THREE.DoubleSide}
          emissive={"#ffffff"} 
          emissiveIntensity={0.1}
          emissiveMap={logoTexture}
        />
      </mesh>
      
      {/* Alternative logo placement on side wall */}
      <mesh position={[-14.7, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 3]} /> {/* Doubled the size */}
        <meshStandardMaterial 
          map={logoTexture}
          transparent={true}
          side={THREE.DoubleSide}
          emissive={"#ffffff"} 
          emissiveIntensity={0.2}
          emissiveMap={logoTexture} /* Makes the logo glow */
        />
      </mesh>
    </group>
  );
}