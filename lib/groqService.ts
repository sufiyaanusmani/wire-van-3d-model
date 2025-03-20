import { BoxData } from "@/app/components/forms/BoxForm";

export async function extractBoxesFromText(text: string): Promise<BoxData[]> {
  try {
    const response = await fetch('/api/extract-boxes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract boxes');
    }

    const data = await response.json();
    
    // Process boxes to ensure all have a shape (default to 'box' if missing)
    const processedBoxes = (data.boxes || []).map((box: { 
      shape?: 'box' | 'cylinder' | 'sphere'; 
      length: number; 
      width: number;
      height: number;
      weight: number;
    }) => {
      // Default to box if no shape is specified
      const shape = box.shape || 'box';
      
      // First create basic box data without radius
      const baseBox = {
        length: box.length,
        width: box.width,
        height: box.height,
        weight: box.weight,
        shape: shape
      };
      
      // Then add radius and adjust dimensions for special shapes
      if (shape === 'cylinder') {
        const radius = Math.max(box.length, box.width) / 2;
        const diameter = radius * 2;
        return {
          ...baseBox,
          radius,
          length: diameter,
          width: diameter
        };
      } else if (shape === 'sphere') {
        const radius = Math.max(box.length, box.width, box.height) / 2;
        const diameter = radius * 2;
        return {
          ...baseBox,
          radius,
          length: diameter,
          width: diameter,
          height: diameter
        };
      }
      
      // Return regular box without radius
      return baseBox;
    }) as BoxData[];
    
    return processedBoxes;
  } catch (error) {
    console.error("Failed to extract boxes:", error);
    throw error;
  }
}