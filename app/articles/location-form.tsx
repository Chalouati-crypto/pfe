"use client";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { arrondissement } from "@/types/articles-schema";
import { Input } from "@/components/ui/input";

export default function Location({ isEditing }: { isEditing: boolean }) {
  const { control, watch, setValue } = useFormContext();
  const selectedDistrict = watch("arrondissement");
  const selectedZone = watch("zone");

  // Get zones based on the selected district
  const zones =
    arrondissement.find((d) => d.name === selectedDistrict)?.zones || [];

  // Get streets based on the selected zone
  const streets = zones.find((z) => z.name === selectedZone)?.streets || [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary mb-4">Localisation</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            name="arrondissement"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrondissement</FormLabel>
                <Select
                  disabled={isEditing}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("zone", "");
                    setValue("rue", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un arrondissement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {arrondissement.map((district) => (
                      <SelectItem key={district.name} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="zone"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("rue", "");
                  }}
                  disabled={!selectedDistrict || isEditing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.name} value={zone.name}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="rue"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rue</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedZone || isEditing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une rue" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {streets.map((street) => (
                      <SelectItem key={street} value={street}>
                        {street}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="number"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero de la voie</FormLabel>
                <FormControl>
                  <Input
                    disabled={isEditing}
                    {...field}
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
