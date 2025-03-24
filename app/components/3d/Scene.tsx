"use client";

import { BoxWithColor } from "@/lib/store";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { Ground } from "./Ground";
import { WireFrameVan } from "./WireFrameVan";
import { BoxesInVan } from "./BoxesInVan";

export function Scene({ boxes }: { boxes: BoxWithColor[] }) {
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