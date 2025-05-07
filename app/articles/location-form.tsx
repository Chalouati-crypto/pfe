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
import dynamic from "next/dynamic";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../../components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

export default function Location({ isEditing }: { isEditing: boolean }) {
  const getMapCenter = () => {
    // Priority: Street > Zone > Arrondissement
    if (selectedStreet) {
      const streetData = zones
        .flatMap((z) => z.streets)
        .find((s) => s.name === selectedStreet);
      return streetData?.coordinates;
    }

    if (selectedZone) {
      const zoneData = zones.find((z) => z.name === selectedZone);
      return zoneData?.coordinates;
    }

    if (selectedDistrict) {
      const districtData = arrondissement.find(
        (d) => d.name === selectedDistrict
      );
      return districtData?.coordinates;
    }

    // Default center (Tunis coordinates)
    return { lat: 36.8065, lng: 10.1815 };
  };
  const { control, watch, setValue } = useFormContext();
  const selectedDistrict = watch("arrondissement");
  const selectedZone = watch("zone");
  const selectedStreet = watch("rue");
  const latitude = watch("x");
  const longitude = watch("y");

  // Get zones based on the selected district
  const zones =
    arrondissement.find((d) => d.name === selectedDistrict)?.zones || [];

  // Get streets based on the selected zone
  const streets = zones.find((z) => z.name === selectedZone)?.streets || [];

  // Handle map marker selection
  const handleMapClick = (lat: number, lng: number) => {
    setValue("x", String(lat));
    setValue("y", String(lng));
  };

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
                      <SelectItem key={district.id} value={district.name}>
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
                      <SelectItem key={zone.id} value={zone.name}>
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
                      <SelectItem key={street.id} value={street.name}>
                        {street.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
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
          /> */}
        </div>

        {/* Map Component */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">
            Sélectionner l&apos;emplacement exact sur la carte
          </h3>
          <div className="border rounded-md overflow-hidden">
            <MapComponent
              arrondissement={selectedDistrict}
              zone={selectedZone}
              street={selectedStreet}
              onMapClick={handleMapClick}
              markerPosition={
                latitude && longitude ? [latitude, longitude] : null
              }
              center={getMapCenter()}
            />
          </div>
        </div>

        {/* Coordinates Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <FormField
            name="x"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude (X)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                    readOnly={isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="y"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude (Y)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                    readOnly={isEditing}
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
