export function Ground() {
    return (
      <>
        {/* Base plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial 
            color="#f0f0f0"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* Grid overlay */}
        <gridHelper 
          args={[30, 30, "#888888", "#CCCCCC"]} 
          position={[0, -1.19, 0]} 
          rotation={[0, 0, 0]}
        />
      </>
    );
  }