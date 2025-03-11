
import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize the map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
    });

    // Add a marker
    new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: 'Property Location'
    });
  }, [latitude, longitude]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg"
    />
  );
};

export default GoogleMap;
