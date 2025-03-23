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

export default function General() {
  const { control } = useFormContext();

  return (
    <div className="">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          Informations générales
        </legend>
        <FormField
          control={control}
          name="general.typeDePropriete"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de propriété</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
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
          name="general.dateDebutImposition"
          render={({ field }) => {
            const dateValue = field.value ? new Date(field.value) : undefined;

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Date debut d&apos;imposition</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP") // Format string to Date for display
                        ) : (
                          <span>Pick a date</span>
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
                        // Convert Date to ISO string before saving
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Vous devez commencer à payer l&apos;impôt à partir de cette
                  date.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </fieldset>
    </div>
  );
}
