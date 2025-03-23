"use client";
import { Controller, useFormContext } from "react-hook-form";

import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { arrondissement } from "@/types/articles-schema";

export default function Location() {
  const { control, watch, setValue } = useFormContext();
  const selectedDistrict = watch("location.arrondissement");
  const selectedZone = watch("location.zone");

  // Get zones based on the selected district
  const zones =
    arrondissement.find((d) => d.name === selectedDistrict)?.zones || [];

  // Get streets based on the selected zone
  const streets = zones.find((z) => z.name === selectedZone)?.streets || [];

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold">Localisation</legend>
      <Controller
        name="location.arrondissement"
        control={control}
        render={({ field }) => (
          <div>
            <label>Arrondissement</label>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value); // Update the district field
                setValue("location.zone", ""); // Reset zone when district changes
                setValue("location.rue", ""); // Reset rue when district changes
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner un arrondissement" />
              </SelectTrigger>
              <SelectContent>
                {arrondissement.map((district) => (
                  <SelectItem key={district.name} value={district.name}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      {/* Zone Select */}
      <Controller
        name="location.zone"
        control={control}
        render={({ field }) => (
          <div>
            <label>Zone</label>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value); // Update the zone field
                setValue("location.rue", ""); // Reset rue when zone changes
              }}
              disabled={!selectedDistrict} // Disable if no district is selected
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.name} value={zone.name}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      {/* Rue Select */}
      <Controller
        name="location.rue"
        control={control}
        render={({ field }) => (
          <div>
            <label>Rue</label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedZone} // Disable if no zone is selected
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une rue" />
              </SelectTrigger>
              <SelectContent>
                {streets.map((street) => (
                  <SelectItem key={street} value={street}>
                    {street}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
      {/* Input fields for Arrondissement, Zone, and Rue */}
    </fieldset>
  );
}
