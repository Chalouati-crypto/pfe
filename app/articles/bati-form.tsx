"use client";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { services } from "@/types/articles-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";

export default function Bati() {
  const { control, watch } = useFormContext();
  const typeDePropriete = watch("typeDePropriete");

  // Return null if the property type is not "bati"
  if (typeDePropriete !== "bati") return null;

  const servicesSelected = watch("services") || [];
  const hasOtherService = servicesSelected.some(
    (s: { id: string; label: string }) => s.id === "Autres"
  );

  // Calculate the service category for display
  const serviceCount = servicesSelected.length;
  let serviceCategory = "";

  if (serviceCount <= 2) {
    serviceCategory = "Catégorie 1 (taux: 8%)";
  } else if (serviceCount <= 4) {
    serviceCategory = "Catégorie 2 (taux: 10%)";
  } else if (serviceCount <= 6) {
    serviceCategory = "Catégorie 3 (taux: 12%)";
  } else {
    serviceCategory = "Catégorie 4 (taux: 14%)";
  }

  // Calculate the surface category for display
  const surfaceCouverte = watch("surfaceCouverte") || 0;
  let surfaceCategory = "";

  if (surfaceCouverte <= 100) {
    surfaceCategory = "Catégorie 1 (prix ref: 150 DH)";
  } else if (surfaceCouverte <= 200) {
    surfaceCategory = "Catégorie 2 (prix ref: 200 DH)";
  } else if (surfaceCouverte <= 400) {
    surfaceCategory = "Catégorie 3 (prix ref: 250 DH)";
  } else {
    surfaceCategory = "Catégorie 4 (prix ref: 300 DH)";
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary mb-4">
        Détails du bâtiment
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="surfaceCouverte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface Couverte (m²)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? 0}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{surfaceCategory}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services (Prestations)</FormLabel>
              <FormDescription>
                {serviceCategory} - Sélectionnez les services disponibles dans
                ce bâtiment
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2 rounded-md border p-2 shadow-sm"
                    >
                      <Checkbox
                        checked={
                          field.value?.some(
                            (s: { id: string; label: string }) =>
                              s.id === service.id
                          ) || service.id === "Nettoyage"
                        }
                        onCheckedChange={(checked: boolean) => {
                          const current = field.value ?? [];
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
                        disabled={service.id === "Nettoyage"}
                      />
                      <FormLabel className="cursor-pointer font-normal">
                        {service.label}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasOtherService && (
          <FormField
            control={control}
            name="autreService"
            render={({ field }) => {
              const fieldValue = Array.isArray(field.value)
                ? field.value
                : typeof field.value === "string" && field.value.length > 0
                ? field.value.split(",")
                : [];
              return (
                <FormItem>
                  <FormLabel>Autres services (précisez)</FormLabel>
                  <FormDescription>
                    Ajoutez d&apos;autres services et appuyez sur Entrée
                  </FormDescription>
                  <FormControl>
                    <TagsInput
                      value={fieldValue}
                      onValueChange={(val) => {
                        // Convert array to comma-separated string before saving
                        field.onChange(
                          Array.isArray(val) ? val.join(",") : val
                        );
                      }}
                      placeholder="Ajouter un service..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
