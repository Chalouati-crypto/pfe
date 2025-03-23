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

export default function Owner() {
  const { control } = useFormContext();

  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-semibold">
        Informations du propriétaire
      </legend>

      {["cin", "nom", "prenom", "email", "adresse", "telephone"].map(
        (fieldName) => (
          <FormField
            key={fieldName}
            control={control}
            name={`owner.${fieldName}`} // Fixed to match the schema
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      )}
    </fieldset>
  );
}
