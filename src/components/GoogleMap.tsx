
import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!latitude || !longitude) {
      setMapError(true);
      return;
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    } else if (!scriptLoading) {
      // Load the Google Maps script if not already loading
      setScriptLoading(true);
      
      // Wait for the script to load and then initialize the map
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMapsLoaded);
          initializeMap();
        }
      }, 100);
      
      // Set a timeout to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleMapsLoaded);
        if (!mapLoaded) {
          setMapError(true);
        }
      }, 10000); // 10 second timeout
    }
  }, [latitude, longitude, scriptLoading]);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    try {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      // Add a marker
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: 'Property Location',
        animation: window.google.maps.Animation.DROP,
      });

      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError(true);
    }
  };

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">Unable to load map. Please check the property location or try again later.</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <div className="animate-pulse text-center p-4">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg shadow-md"
    />
  );
};

export default GoogleMap;
