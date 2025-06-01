"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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

// Custom calendar navigation component with year selection
function CalendarWithYearNavigation({
  selected,
  onSelect,
  disabled,
}: {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
}) {
  const [date, setDate] = React.useState<Date>(selected || new Date());
  const [calendarView, setCalendarView] = React.useState<
    "days" | "months" | "years"
  >("days");

  // Generate years for selection (current year - 100 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 106 }, (_, i) => currentYear - 100 + i);

  // Generate months for selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return format(date, "MMMM", { locale: fr });
  });

  const handleYearSelect = (year: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    setDate(newDate);
    setCalendarView("months");
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(date);
    newDate.setMonth(monthIndex);
    setDate(newDate);
    setCalendarView("days");
  };

  return (
    <div className="p-3">
      {calendarView === "days" && (
        <>
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarView("years")}
              disabled={disabled}
            >
              {format(date, "yyyy")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarView("months")}
              disabled={disabled}
            >
              {format(date, "MMMM", { locale: fr })}
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={onSelect}
            month={date}
            onMonthChange={setDate}
            disabled={disabled}
            initialFocus
          />
        </>
      )}

      {calendarView === "months" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setFullYear(date.getFullYear() - 1);
                setDate(newDate);
              }}
              disabled={disabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarView("years")}
              disabled={disabled}
            >
              {format(date, "yyyy")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setFullYear(date.getFullYear() + 1);
                setDate(newDate);
              }}
              disabled={disabled}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={date.getMonth() === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleMonthSelect(index)}
                disabled={disabled}
                className="capitalize"
              >
                {month.substring(0, 3)}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCalendarView("days")}
            className="mt-4 w-full"
            disabled={disabled}
          >
            Retour au calendrier
          </Button>
        </>
      )}

      {calendarView === "years" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-medium">Sélectionner une année</h3>
          </div>
          <div className="h-64 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={date.getFullYear() === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                  disabled={disabled}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function General({ isEditing }: { isEditing: boolean }) {
  const { control, watch } = useFormContext();
  const densiteUrbain = watch("densiteUrbain");
  const typeDePropriete = watch("typeDePropriete");
  const [open, setOpen] = React.useState(false);

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
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isEditing}
                          onClick={() => setOpen(true)}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarWithYearNavigation
                          selected={dateValue}
                          onSelect={(date) => {
                            if (date) {
                              // Format as YYYY-MM-DD
                              const formattedDate = formatDateToYYYYMMDD(date);
                              field.onChange(formattedDate);
                              setOpen(false); // Close the popover after selection
                            }
                          }}
                          disabled={isEditing}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
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
