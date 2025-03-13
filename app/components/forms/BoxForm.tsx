"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
    onAddBox(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Add Box</Button>
      </form>
    </Form>
  );
}