"use client";

import { getRotatedDimensions, packBoxesInVan } from "@/lib/binPacking";
import { BoxWithColor, useBoxStore } from "@/lib/store";
import { useMemo } from "react";
import { Box } from "./Box";

export function BoxesInVan({ boxes }: { boxes: BoxWithColor[] }) {
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
              name: box.name,
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