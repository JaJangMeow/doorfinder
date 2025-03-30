import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  popup?: string;
  zoom?: number;
  height?: string;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  popup = 'Property Location',
  zoom = 15,
  height = '100%',
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only if it hasn't been initialized yet
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      
      // Add marker with popup
      const marker = L.marker([latitude, longitude]).addTo(map);
      if (popup) {
        marker.bindPopup(popup).openPopup();
      }
      
      // Store map instance for cleanup
      mapInstanceRef.current = map;
      
      // Ensure proper sizing when map container is visible
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    } else {
      // If map already exists, just update the view and marker
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      
      // Clear all existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });
      
      // Add new marker
      const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
      if (popup) {
        marker.bindPopup(popup).openPopup();
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, popup]);

  return (
    <div ref={mapRef} style={{ height }} className={className} />
  );
};

export default PropertyMap;
