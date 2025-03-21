"use client";

import { Button } from "@/components/ui/button";
import { calculateVolume } from "@/lib/calculations";
import { BoxData } from "./BoxForm";

interface BoxListProps {
  boxes: BoxData[];
  onRemoveBox: (index: number) => void;
}

export function BoxList({ boxes, onRemoveBox }: BoxListProps) {
  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">Boxes ({boxes.length})</h2>
      {boxes.length === 0 ? (
        <p className="text-muted-foreground">No boxes added yet</p>
      ) : (
        <div className="space-y-2">
          {boxes.map((box, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded-sm">
              <div>
                <p className="text-sm font-medium">
                  {box.name || `Box ${index + 1}`}
                </p>
                <p className="text-sm">
                  {box.length} × {box.width} × {box.height} cm | {box.weight} kg
                </p>
                <p className="text-xs text-muted-foreground">
                  Volume: {calculateVolume(box).toLocaleString()} cm³
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => onRemoveBox(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}