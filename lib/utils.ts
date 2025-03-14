import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BoxData } from "@/app/components/forms/BoxForm";
import { calculateVolume } from "./calculations";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wouldExceedLimits(
  newBox: BoxData,
  existingBoxes: BoxData[],
  vanWidth: number,
  vanHeight: number,
  vanDepth: number,
  weightLimit: number
): { exceeds: boolean; reason?: string } {
  // Calculate total volume and weight with the new box
  const totalVolume = existingBoxes.reduce(
    (sum, box) => sum + calculateVolume(box),
    0
  ) + calculateVolume(newBox);
  
  const totalWeight = existingBoxes.reduce(
    (sum, box) => sum + box.weight,
    0
  ) + newBox.weight;
  
  // Calculate van volume in cubic cm
  const vanVolume = vanWidth * vanHeight * vanDepth;
  
  // Check if adding this box would exceed volume capacity
  if (totalVolume > vanVolume) {
    return { 
      exceeds: true, 
      reason: `Box would exceed van's volume capacity by ${(totalVolume - vanVolume).toLocaleString()} cm³` 
    };
  }
  
  // Check if adding this box would exceed weight capacity
  if (totalWeight > weightLimit) {
    return { 
      exceeds: true, 
      reason: `Box would exceed van's weight capacity by ${(totalWeight - weightLimit).toFixed(2)} kg` 
    };
  }
  
  // Check if box dimensions exceed van dimensions
  if (newBox.width > vanWidth || newBox.height > vanHeight || newBox.length > vanDepth) {
    return { 
      exceeds: true, 
      reason: "Box dimensions exceed van dimensions" 
    };
  }
  
  return { exceeds: false };
}
