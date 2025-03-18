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
    console.log("Extracted boxes:", data);
    
    // Process boxes to ensure all have a shape (default to 'box' if missing)
    const processedBoxes = (data.boxes || []).map((box: { shape: string; length: number; width: number; }) => ({
      ...box,
      shape: box.shape || 'box',
      // For cylinders and spheres, handle radius calculation if needed
      radius: box.shape === 'cylinder' || box.shape === 'sphere' ? Math.max(box.length, box.width) / 2 : undefined
    }));
    
    return processedBoxes;
  } catch (error) {
    console.error("Failed to extract boxes:", error);
    throw error;
  }
}