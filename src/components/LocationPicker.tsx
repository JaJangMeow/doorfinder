
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (coordinates: Coordinates) => void;
  defaultLocation?: Coordinates;
  className?: string;
  height?: string;
  zoom?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  defaultLocation = { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore coordinates
  className,
  height = '300px',
  zoom = 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultLocation);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox with your token
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
    
    const initializedMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // Updated to use Mapbox's default style
      center: [coordinates.lng, coordinates.lat],
      zoom: zoom
    });
    
    map.current = initializedMap;

    // Add navigation controls
    initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add initial marker
    const initialMarker = new mapboxgl.Marker({ draggable: true, color: '#FF0000' })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(initializedMap);
    
    marker.current = initialMarker;

    // Add event listener for when marker is dragged
    initialMarker.on('dragend', () => {
      const lngLat = initialMarker.getLngLat();
      const newCoordinates = {
        lat: lngLat.lat,
        lng: lngLat.lng
      };
      setCoordinates(newCoordinates);
      onLocationSelect(newCoordinates);
    });

    // Add event listener for map clicks to move marker
    initializedMap.on('click', (e) => {
      if (marker.current) {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        
        const newCoordinates = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        
        setCoordinates(newCoordinates);
        onLocationSelect(newCoordinates);
      }
    });

    // Clean up on unmount
    return () => {
      initializedMap.remove();
    };
  }, [onLocationSelect, zoom]);

  // Update marker if defaultLocation changes
  useEffect(() => {
    if (map.current && marker.current && defaultLocation) {
      marker.current.setLngLat([defaultLocation.lng, defaultLocation.lat]);
      map.current.flyTo({
        center: [defaultLocation.lng, defaultLocation.lat],
        essential: true
      });
      setCoordinates(defaultLocation);
    }
  }, [defaultLocation]);

  return (
    <div className={`${className || ''}`}>
      <div className="glass">
        <div ref={mapContainer} className="w-full rounded-lg" style={{ height }} />
      </div>
      <div className="mt-2 text-sm flex items-center text-muted-foreground">
        <MapPin size={14} className="mr-1" />
        <span>Click on the map or drag the marker to set the location</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default LocationPicker;
