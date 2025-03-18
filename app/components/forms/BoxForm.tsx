"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useBoxStore } from "@/lib/store";
import { wouldExceedLimits } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Update the schema to handle validation properly for different shapes
const boxSchema = z.object({
  length: z.coerce.number().min(0),
  width: z.coerce.number().min(0),
  height: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
  color: z.string().optional(),
  shape: z.enum(['box', 'cylinder', 'sphere']).default('box'),
  radius: z.coerce.number().optional(),
}).refine(data => {
  // Add shape-specific validation
  if (data.shape === 'cylinder' || data.shape === 'sphere') {
    return data.radius !== undefined && data.radius > 0;
  }
  return true;
}, {
  message: "Radius is required for cylinders and spheres",
  path: ["radius"]
}).refine(data => {
  // Validate height for cylinders and boxes
  if (data.shape === 'box' || data.shape === 'cylinder') {
    return data.height > 0;
  }
  return true;
}, {
  message: "Height must be greater than 0",
  path: ["height"]
}).refine(data => {
  // Validate length for boxes
  if (data.shape === 'box') {
    return data.length > 0;
  }
  return true;
}, {
  message: "Length must be greater than 0",
  path: ["length"]
}).refine(data => {
  // Validate width for boxes
  if (data.shape === 'box') {
    return data.width > 0;
  }
  return true;
}, {
  message: "Width must be greater than 0",
  path: ["width"]
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
  
  // Update form defaultValues to use strings
  const form = useForm<z.infer<typeof boxSchema>>({
    resolver: zodResolver(boxSchema),
    defaultValues: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      shape: 'box',
      radius: 0,
    },
  });

  // Watch the shape field to update dimensions accordingly
  const shape = useWatch({
    control: form.control,
    name: "shape",
    defaultValue: "box"
  });

  // Watch radius for derived dimensions
  const radius = useWatch({
    control: form.control,
    name: "radius",
    defaultValue: 0
  });

  // Fix the useEffect to handle dimensions properly
  useEffect(() => {
    if (shape === 'cylinder' && radius && radius > 0) {
      const diameterValue = radius * 2;
      form.setValue("length", diameterValue);
      form.setValue("width", diameterValue);
    } else if (shape === 'sphere' && radius && radius > 0) {
      const diameterValue = radius * 2;
      form.setValue("length", diameterValue);
      form.setValue("width", diameterValue);
      form.setValue("height", diameterValue);
    }
  }, [shape, radius, form]);

  // Update the onSubmit handler to handle different shapes correctly
  function onSubmit(values: z.infer<typeof boxSchema>) {
    setError(null);
    
    // Process values based on shape
    const processedValues = { ...values };
    
    if (values.shape === 'cylinder' && values.radius) {
      const diameter = values.radius * 2;
      processedValues.length = diameter;
      processedValues.width = diameter;
    } else if (values.shape === 'sphere' && values.radius) {
      const diameter = values.radius * 2;
      processedValues.length = diameter;
      processedValues.width = diameter;
      processedValues.height = diameter;
    }
    
    // For debugging
    console.log("Processed values:", processedValues);
    
    // Check if adding this box would exceed any limits
    const check = wouldExceedLimits(
      processedValues, 
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
    
    onAddBox(processedValues);
    
    // Reset form
    form.reset({
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      shape: 'box',
      radius: 0,
    });
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
        
        <FormField
          control={form.control}
          name="shape"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shape</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="cylinder">Cylinder</SelectItem>
                  <SelectItem value="sphere">Sphere</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          {/* Only show length/width/height for box */}
          {shape === 'box' && (
            <>
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
            </>
          )}
          
          {/* Show radius for cylinder and sphere */}
          {(shape === 'cylinder' || shape === 'sphere') && (
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Radius (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Radius" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Show height only for cylinder */}
          {shape === 'cylinder' && (
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
          )}
          
          {/* Weight is common for all shapes */}
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