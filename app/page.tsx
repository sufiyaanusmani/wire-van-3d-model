"use client";

import { BoxForm } from "@/app/components/forms/BoxForm";
import { BoxList } from "@/app/components/forms/BoxList";
import { VanModel } from "@/app/components/3d/VanModel";
import { VanConfigForm } from "@/app/components/forms/VanConfigForm";
import { CapacityOverview } from "@/app/components/CapacityOverview";
import { useBoxStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { 
    boxes, 
    addBox, 
    removeBox, 
    clearBoxes
  } = useBoxStore();

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Wire Van 3D Model</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <VanConfigForm />
          
          <div className="border rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Add Boxes</h2>
            <BoxForm onAddBox={addBox} />
          </div>
          
          <CapacityOverview />
          
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Cargo Items</h2>
            {boxes.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearBoxes}>
                Clear All
              </Button>
            )}
          </div>
          
          <BoxList boxes={boxes} onRemoveBox={removeBox} />
        </div>
        
        <div className="md:col-span-2">
          <VanModel />
        </div>
      </div>
    </main>
  );
}