"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useBoxStore } from "@/lib/store";
import { wouldExceedLimits } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const boxSchema = z.object({
  length: z.string().transform((val) => parseFloat(val)),
  width: z.string().transform((val) => parseFloat(val)),
  height: z.string().transform((val) => parseFloat(val)),
  weight: z.string().transform((val) => parseFloat(val)),
  color: z.string().optional(),
});

export type BoxData = z.infer<typeof boxSchema>;

interface BoxFormProps {
  onAddBox: (box: BoxData) => void;
}

export function BoxForm({ onAddBox }: BoxFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Get existing boxes and van configuration from store
  const boxes = useBoxStore(state => state.boxes);
  const van = useBoxStore(state => state.van);
  
  // Calculate if any limits are already reached
  const vanVolume = van.width * van.height * van.depth;
  const totalVolume = boxes.reduce((sum, box) => sum + (box.length * box.width * box.height), 0);
  const totalWeight = boxes.reduce((sum, box) => sum + box.weight, 0);
  
  const volumeExceeded = totalVolume >= vanVolume;
  const weightExceeded = totalWeight >= van.maxWeight;
  const limitsReached = volumeExceeded || weightExceeded;
  
  const form = useForm<z.infer<typeof boxSchema>>({
    resolver: zodResolver(boxSchema),
    defaultValues: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
  });

  function onSubmit(values: z.infer<typeof boxSchema>) {
    setError(null);
    
    // Check if adding this box would exceed any limits
    const check = wouldExceedLimits(
      values, 
      boxes, 
      van.width, 
      van.height, 
      van.depth, 
      van.maxWeight
    );
    
    if (check.exceeds) {
      setError(check.reason || "Cannot add box: capacity limits exceeded");
      return;
    }
    
    onAddBox(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {limitsReached && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {volumeExceeded ? "Van volume capacity reached. " : ""}
              {weightExceeded ? "Van weight capacity reached." : ""}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Length" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Width" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Height" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Weight" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={limitsReached}>Add Box</Button>
      </form>
    </Form>
  );
}