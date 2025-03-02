"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  center: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function Map({ center, onLocationSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(center, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      markerRef.current = L.marker(center, { draggable: true }).addTo(
        mapRef.current
      );

      if (onLocationSelect) {
        markerRef.current.on("dragend", () => {
          const position = markerRef.current?.getLatLng();
          if (position) {
            onLocationSelect(position.lat, position.lng);
          }
        });

        mapRef.current.on("click", (e) => {
          const { lat, lng } = e.latlng;
          markerRef.current?.setLatLng([lat, lng]);
          onLocationSelect(lat, lng);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" className="h-full w-full" />;
}
