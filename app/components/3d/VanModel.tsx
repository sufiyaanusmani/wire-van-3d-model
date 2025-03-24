"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useBoxStore } from "@/lib/store";
import { LoadingOverlay } from "../LoadingOverlay";
import { Scene } from "./Scene";



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