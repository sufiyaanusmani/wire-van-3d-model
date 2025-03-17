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
    return data.boxes || [];
  } catch (error) {
    console.error("Failed to extract boxes:", error);
    throw error;
  }
}