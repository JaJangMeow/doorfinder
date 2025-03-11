
import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !latitude || !longitude) {
      console.error('Map ref or coordinates missing:', { mapRef: !!mapRef.current, latitude, longitude });
      setMapError(true);
      return;
    }

    try {
      console.log('Initializing map with coordinates:', { latitude, longitude });
      
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
      setMapError(false);
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError(true);
    }
  };

  // Load Google Maps API script
  useEffect(() => {
    // Skip if latitude or longitude are invalid
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      setMapError(true);
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded, initializing map');
      setScriptLoaded(true);
      initializeMap();
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Google Maps script already exists in document');
      setScriptLoaded(true);
      return;
    }

    // Create callback function for the Google Maps script
    window.initMap = () => {
      console.log('Google Maps script loaded, callback triggered');
      setScriptLoaded(true);
    };

    // Load the Google Maps script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      console.error('Google Maps script failed to load:', e);
      setMapError(true);
    };
    
    document.head.appendChild(script);
    console.log('Google Maps script added to document head');

    return () => {
      // Clean up only if we created the script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [latitude, longitude]);

  // Initialize map when script is loaded
  useEffect(() => {
    if (scriptLoaded && latitude && longitude) {
      console.log('Script loaded, initializing map');
      initializeMap();
    }
  }, [scriptLoaded, latitude, longitude]);

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">Unable to load map. Please check the property location or try again later.</p>
          <button 
            className="mt-2 text-sm text-primary underline"
            onClick={() => {
              setMapError(false);
              setMapLoaded(false);
              initializeMap();
            }}
          >
            Try again
          </button>
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
