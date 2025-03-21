"use client";

import { useEffect, useState } from 'react';

export function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate loading progress
    let interval: NodeJS.Timeout;
    let currentProgress = 0;
    
    const incrementProgress = () => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(Math.floor(currentProgress));
      
      if (currentProgress < 100) {
        interval = setTimeout(incrementProgress, 200);
      }
    };
    
    incrementProgress();
    
    return () => {
      if (interval) clearTimeout(interval);
    };
  }, []);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
        <div className="text-lg font-medium">Loading {progress}%</div>
        <div className="mt-2 text-sm text-muted-foreground">Preparing your 3D scene...</div>
      </div>
    </div>
  );
}