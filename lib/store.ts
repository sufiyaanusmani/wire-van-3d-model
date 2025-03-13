import { create } from 'zustand';
import { BoxData } from '@/app/components/box-form';
import { 
  calculateTotalVolume, 
  calculateTotalWeight, 
  calculateCapacityUsage 
} from '@/lib/calculations';

interface VanDimensions {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
}

interface BoxStore {
  boxes: BoxData[];
  van: VanDimensions;
  addBox: (box: BoxData) => void;
  removeBox: (index: number) => void;
  clearBoxes: () => void;
  updateVan: (dimensions: VanDimensions) => void;
  getTotalVolume: () => number;
  getTotalWeight: () => number;
  getCapacityUsage: () => number;
  getWeightCapacityUsage: () => number;
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxes: [],
  van: {
    width: 180,
    height: 180,
    depth: 300,
    maxWeight: 1000
  },
  addBox: (box) => set((state) => ({ 
    boxes: [...state.boxes, box] 
  })),
  removeBox: (index) => set((state) => ({ 
    boxes: state.boxes.filter((_, i) => i !== index) 
  })),
  clearBoxes: () => set({ boxes: [] }),
  updateVan: (dimensions) => set({ van: dimensions }),
  getTotalVolume: () => calculateTotalVolume(get().boxes),
  getTotalWeight: () => calculateTotalWeight(get().boxes),
  getCapacityUsage: () => calculateCapacityUsage(get().boxes, get().van),
  getWeightCapacityUsage: () => {
    const totalWeight = calculateTotalWeight(get().boxes);
    return (totalWeight / get().van.maxWeight) * 100;
  }
}));