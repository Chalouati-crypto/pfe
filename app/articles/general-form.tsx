"use client";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Helper function to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function General({ isEditing }: { isEditing: boolean }) {
  const { control, watch } = useFormContext();
  const densiteUrbain = watch("densiteUrbain");
  const typeDePropriete = watch("typeDePropriete");

  // Get density description for display
  let densityDescription = "";
  if (typeDePropriete === "non bati") {
    if (densiteUrbain === "haute") {
      densityDescription = "Prix: 0.300 DH/m²";
    } else if (densiteUrbain === "moyenne") {
      densityDescription = "Prix: 0.090 DH/m²";
    } else if (densiteUrbain === "basse") {
      densityDescription = "Prix: 0.030 DH/m²";
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary mb-4">
        Informations générales
      </h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="typeDePropriete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de propriété</FormLabel>
                <Select
                  disabled={isEditing}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bati">Bâti</SelectItem>
                    <SelectItem value="non bati">Non Bâti</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="surfaceTotale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface Totale (m²)</FormLabel>
                <FormControl>
                  <Input
                    disabled={isEditing}
                    {...field}
                    value={field.value ?? 0}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="densiteUrbain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Densité urbaine</FormLabel>
                <FormControl>
                  <Select
                    disabled={isEditing}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une densité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="moyenne">Moyenne</SelectItem>
                      <SelectItem value="basse">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {densityDescription && (
                  <FormDescription>{densityDescription}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dateDebutImposition"
            render={({ field }) => {
              // Try to parse the date value
              let dateValue: Date | undefined;
              try {
                dateValue = field.value ? new Date(field.value) : undefined;

                // Check if the date is valid
                if (dateValue && isNaN(dateValue.getTime())) {
                  dateValue = undefined;
                }
              } catch (error) {
                console.error("Error parsing date:", error);
                dateValue = undefined;
              }

              return (
                <FormItem>
                  <FormLabel>Date début d&apos;imposition</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={(date) => {
                          if (date) {
                            // Format as YYYY-MM-DD
                            const formattedDate = formatDateToYYYYMMDD(date);
                            field.onChange(formattedDate);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date à partir de laquelle l&apos;imposition commence.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
