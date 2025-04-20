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

export default function Owner({ isEditing }: { isEditing: boolean }) {
  const { control } = useFormContext();

  const fields = [
    { name: "cin", label: "CIN", type: "text" },
    { name: "nom", label: "Nom", type: "text" },
    { name: "prenom", label: "Prénom", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "adresse", label: "Adresse", type: "text" },
    { name: "telephone", label: "Téléphone", type: "tel" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary mb-4">
        Informations du propriétaire
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={control}
            disabled={isEditing}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Input
                  {...formField}
                  type={field.type}
                  value={formField.value ?? ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
