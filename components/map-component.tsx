"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { arrondissement } from "@/types/articles-schema"; // Import your location data

// Fix Leaflet marker icons
function LeafletIconFix() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);
  return null;
}

const DEFAULT_CENTER = [36.8065, 10.1815]; // Tunis coordinates
const DEFAULT_ZOOM = 13;

function MapEvents({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

function MapUpdater({ selectedDistrict, selectedZone, selectedStreet }) {
  const map = useMap();

  useEffect(() => {
    let targetCoordinates = DEFAULT_CENTER;
    let zoom = DEFAULT_ZOOM;

    const district = arrondissement.find((d) => d.name === selectedDistrict);

    if (district) {
      targetCoordinates = [district.coordinates.lat, district.coordinates.lng];
      zoom = 12;

      const zone = district.zones.find((z) => z.name === selectedZone);
      if (zone) {
        targetCoordinates = [zone.coordinates.lat, zone.coordinates.lng];
        zoom = 14;

        const street = zone.streets.find((s) => s.name === selectedStreet);
        if (street) {
          targetCoordinates = [street.coordinates.lat, street.coordinates.lng];
          zoom = 16;
        }
      }
    }

    map.flyTo(targetCoordinates, zoom, {
      animate: true,
      duration: 0.5,
    });
  }, [map, selectedDistrict, selectedZone, selectedStreet]);

  return null;
}

export default function MapComponent({
  arrondissement: selectedDistrict,
  zone: selectedZone,
  street: selectedStreet,
  onMapClick,
  markerPosition,
}) {
  const [map, setMap] = useState(null);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "200px", width: "100%" }}
      scrollWheelZoom={true}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LeafletIconFix />
      <MapEvents onMapClick={onMapClick} />
      <MapUpdater
        selectedDistrict={selectedDistrict}
        selectedZone={selectedZone}
        selectedStreet={selectedStreet}
      />

      {markerPosition && <Marker position={markerPosition} />}
    </MapContainer>
  );
}
