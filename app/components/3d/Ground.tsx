import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Ground() {
  // Load textures for concrete floor
  const [
    concreteBaseColor,
    concreteNormalMap,
    concreteRoughnessMap
  ] = useTexture([
    '/textures/Gravel040_1K-JPG_Color.jpg',
    '/textures/Gravel040_1K-JPG_NormalGL.jpg',
    '/textures/Gravel040_1K-JPG_Roughness.jpg'
  ]);

  // Configure texture repeating
  [concreteBaseColor, concreteNormalMap, concreteRoughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
  });

  return (
    <group>
      {/* Enhanced concrete ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          map={concreteBaseColor}
          normalMap={concreteNormalMap}
          roughnessMap={concreteRoughnessMap}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Subtle grid lines (more professional looking) */}
      <gridHelper 
        args={[30, 30, "#555555", "#777777"]} 
        position={[0, -1.19, 0]}
      />
      
      {/* Loading dock walls */}
      <mesh position={[0, 3, -15]} castShadow>
        <boxGeometry args={[30, 8, 0.5]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Side wall left */}
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[30, 8, 0.5]} />
        <meshStandardMaterial color="#d8d8d8" />
      </mesh>
      
      {/* Loading dock platform */}
      <mesh position={[0, -1, -10]} castShadow>
        <boxGeometry args={[20, 0.4, 5]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      
      {/* Warehouse ceiling */}
      <mesh position={[0, 7, 0]}>
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
      
      {/* Add warehouse props */}
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
        <mesh key={`smallbox-${i}`} position={[pos[0], -0.5, pos[1]]} castShadow>
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
          alphaMap={createSafetyLinesTexture()}
        />
      </mesh>
    </group>
  );
}

// Function to create a safety lines texture
function createSafetyLinesTexture() {
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
}