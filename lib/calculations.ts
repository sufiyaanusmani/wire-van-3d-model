import { BoxData } from "@/app/components/forms/BoxForm";

// Calculate volume of a box
export function calculateVolume(box: BoxData): number {
  return box.length * box.width * box.height;
}

// Calculate total volume of all boxes
export function calculateTotalVolume(boxes: BoxData[]): number {
  return boxes.reduce((total, box) => total + calculateVolume(box), 0);
}

// Calculate total weight of all boxes
export function calculateTotalWeight(boxes: BoxData[]): number {
  return boxes.reduce((total, box) => total + box.weight, 0);
}

// Calculate van volume
export function calculateVanVolume(van: { width: number, height: number, depth: number }): number {
  return van.width * van.height * van.depth;
}

// Calculate cargo capacity percentage
export function calculateCapacityUsage(boxes: BoxData[], van: { width: number, height: number, depth: number }): number {
  const totalBoxVolume = calculateTotalVolume(boxes);
  const vanVolume = calculateVanVolume(van);
  return (totalBoxVolume / vanVolume) * 100;
}