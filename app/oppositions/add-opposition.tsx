"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { addOpposition } from "@/server/actions/oppositions";
import { services } from "@/types/articles-schema";

const serviceOptions = services;

// Create a schema for the opposition form
export const createOppositionSchema = z.object({
  articleId: z.coerce.number().int().positive(),
  proposedSurfaceCouverte: z.coerce.number().optional(),
  proposedServices: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
      })
    )
    .optional(),
  proposedAutreService: z.string().optional(),
  reason: z
    .string()
    .min(10, "Please provide a detailed reason for the opposition"),
});

export type OppositionFormData = z.infer<typeof createOppositionSchema>;

export function AddOppositionForm({
  articleId,
  currentSurfaceCouverte,
  currentServices,
  currentAutreService,
  handleClose,
}: {
  articleId: number;
  currentSurfaceCouverte?: number | null;
  currentServices?: Array<{ id: string; label?: string }> | null;
  currentAutreService?: string | null;
  handleClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to track selected services
  const [selectedServices, setSelectedServices] = useState<string[]>(
    currentServices?.map((service) => service.id) || []
  );

  const form = useForm<OppositionFormData>({
    resolver: zodResolver(createOppositionSchema),
    defaultValues: {
      articleId,
      proposedSurfaceCouverte: currentSurfaceCouverte || undefined,
      proposedServices: currentServices || [],
      proposedAutreService: currentAutreService || "",
      reason: "",
    },
  });
  const { errors } = form.formState;

  useEffect(() => {
    console.log("these are the form errors", errors);
  }, [errors]);

  const onSubmit = async (values: OppositionFormData) => {
    setIsSubmitting(true);
    try {
      // Transform the selected service IDs into the required format
      const formattedServices = selectedServices.map((id) => {
        const service = serviceOptions.find((s) => s.id === id);
        return {
          id,
          label: service?.label,
        };
      });

      // Update the form values with the formatted services
      const submissionData = {
        ...values,
        proposedServices:
          formattedServices.length > 0 ? formattedServices : undefined,
      };

      const result = await addOpposition(submissionData);
      if (result.success) {
        toast.success("Opposition submitted successfully");
        handleClose();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      toast.error("Failed to submit opposition");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle service selection changes
  const handleServiceChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, id]);
    } else {
      setSelectedServices((prev) =>
        prev.filter((serviceId) => serviceId !== id)
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-4">
            <input type="hidden" name="articleId" value={articleId} />
            <FormItem>
              <FormLabel>Article ID</FormLabel>
              <FormControl>
                <Input value={articleId} readOnly className="bg-muted" />
              </FormControl>
              <FormDescription>
                This is the ID of the article you are submitting an opposition
                for
              </FormDescription>
            </FormItem>

            {currentSurfaceCouverte > 0 && (
              <FormField
                name="proposedSurfaceCouverte"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Surface Couverte (m²)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder={
                          currentSurfaceCouverte?.toString() ||
                          "Enter new surface value"
                        }
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? Number.parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Current value: {currentSurfaceCouverte || "Not specified"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Proposed Services</FormLabel>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                {serviceOptions.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) =>
                        handleServiceChange(service.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Current services:{" "}
                {currentServices?.map((s) => s.label || s.id).join(", ") ||
                  "None"}
              </FormDescription>
            </div>

            <FormField
              name="proposedAutreService"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Other Services</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={
                        currentAutreService || "Specify other services"
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Current value: {currentAutreService || "None"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="reason"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Opposition</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please provide a detailed explanation for this opposition"
                      className="min-h-[50px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Explain why you believe the current information is incorrect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn("w-full", isSubmitting ? "animate-pulse" : "")}
            >
              {isSubmitting ? "Submitting..." : "Submit Opposition"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
