"use client";

import { useBoxStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateVanVolume } from '@/lib/calculations';

export function CapacityOverview() {
  const { van, getTotalVolume, getTotalWeight, getCapacityUsage, getWeightCapacityUsage } = useBoxStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargo Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-medium">Volume Usage</p>
            <p className="text-sm font-medium">{getCapacityUsage().toFixed(1)}%</p>
          </div>
          <Progress value={getCapacityUsage()} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <p>{getTotalVolume().toLocaleString()} cm³ used</p>
            <p>{calculateVanVolume(van).toLocaleString()} cm³ total</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-medium">Weight Usage</p>
            <p className="text-sm font-medium">{getWeightCapacityUsage().toFixed(1)}%</p>
          </div>
          <Progress value={getWeightCapacityUsage()} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <p>{getTotalWeight().toLocaleString()} kg used</p>
            <p>{van.maxWeight.toLocaleString()} kg max</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm mb-1"><span className="font-medium">Van Dimensions:</span> {van.width} × {van.height} × {van.depth} cm</p>
          <p className="text-sm"><span className="font-medium">Maximum Load:</span> {van.maxWeight} kg</p>
        </div>
      </CardContent>
    </Card>
  );
}