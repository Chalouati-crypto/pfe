"use client";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { services } from "@/types/articles-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Bati() {
  const { control, watch } = useFormContext();
  const typeDePropriete = watch("general.typeDePropriete"); // Fix: Correct path

  // Return null if the property type is not "bati"
  if (typeDePropriete !== "bati") return null;

  const servicesSelected = watch("bati_details.services") || [];

  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-semibold">Détails du bâti</legend>

      {["surfaceTotale", "surfaceCouverte"].map((fieldName) => (
        <FormField
          key={fieldName}
          control={control}
          name={`bati_details.${fieldName}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {fieldName === "surfaceTotale"
                  ? "Surface Totale"
                  : "Surface Couverte"}
              </FormLabel>
              <FormControl>
                <Input
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
      ))}

      <FormField
        control={control}
        name="bati_details.densiteUrbain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>densité urbaine</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une densite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bati_details.services"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Services</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        field.value?.some(
                          (s: { id: string; label: string }) =>
                            s.id === service.id
                        ) || service.id === "Nettoyage"
                      }
                      onCheckedChange={(checked: boolean) => {
                        const current = field.value ?? []; // Ensure field.value is an array

                        const newServices = checked
                          ? [
                              ...current,
                              { id: service.id, label: service.label },
                            ]
                          : current.filter(
                              (s: { id: string; label: string }) =>
                                s.id !== service.id
                            );

                        field.onChange(newServices);
                      }}
                      disabled={service.id === "Nettoyage"} // "Nettoyage" is disabled but still checked
                    />
                    <FormLabel>{service.label}</FormLabel>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {servicesSelected.some(
        (s: { id: string; label: string }) => s.id === "Autres"
      ) && (
        <FormField
          control={control}
          name="bati_details.autreService"
          render={({ field }) => {
            const fieldValue = Array.isArray(field.value)
              ? field.value
              : typeof field.value === "string" && field.value.length > 0
              ? field.value.split(",") // Convert string back to array
              : [];
            return (
              <FormItem>
                <FormLabel>Veuillez préciser</FormLabel>
                <FormControl>
                  <TagsInput
                    value={fieldValue}
                    onValueChange={(val) => field.onChange(val)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </fieldset>
  );
}
