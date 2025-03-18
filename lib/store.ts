import { create } from 'zustand';
import {
  calculateTotalVolume,
  calculateTotalWeight,
  calculateCapacityUsage
} from '@/lib/calculations';
import { BoxData } from '@/app/components/forms/BoxForm';
import { packBoxesInVan } from "./binPacking";

interface VanDimensions {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
}

// Update BoxData interface or extend it
export interface BoxWithColor extends BoxData {
  color: string;
}

interface BoxStore {
  boxes: BoxWithColor[];
  van: VanDimensions;
  addBox: (box: BoxData) => void;
  removeBox: (index: number) => void;
  clearBoxes: () => void;
  updateVan: (dimensions: VanDimensions) => void;
  getTotalVolume: () => number;
  getTotalWeight: () => number;
  getCapacityUsage: () => number;
  getWeightCapacityUsage: () => number;
  canAllBoxesFit: () => boolean;
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxes: [] as BoxWithColor[],
  van: {
    width: 180, // Default van width (cm)
    height: 180, // Default van height (cm)
    depth: 350, // Default van depth (cm)
    maxWeight: 1500, // Default max weight (kg)
  },
  addBox: (box) => set((state) => ({
    boxes: [
      ...state.boxes,
      {
        ...box,
        // Generate a vibrant random color
        color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
      }
    ]
  })),
  removeBox: (index) => set((state) => ({
    boxes: state.boxes.filter((_, i) => i !== index)
  })),
  clearBoxes: () => set({ boxes: [] }),
  updateVan: (dimensions) => set({ van: dimensions }),
  getTotalVolume: () => calculateTotalVolume(get().boxes),
  getTotalWeight: () => calculateTotalWeight(get().boxes),
  getCapacityUsage: () => calculateCapacityUsage(get().boxes, get().van),
  getWeightCapacityUsage: () => (get().getTotalWeight() / get().van.maxWeight) * 100,
  canAllBoxesFit: () => {
    const { boxes, van } = get();
    const packedBoxes = packBoxesInVan(boxes, van);
    return packedBoxes.length === boxes.length;
  }
}));