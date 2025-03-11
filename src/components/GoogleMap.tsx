
import React, { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) {
      setMapError(true);
      return;
    }

    // Create a global callback function for the Google Maps script
    window.initMap = () => {
      try {
        if (!mapRef.current) return;
        
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

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      window.initMap();
      return;
    }

    // Load the Google Maps script with the callback
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyCqG_rXoFfwIRg8eoCV_joDHYk8ZrkpOsg'}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Google Maps script failed to load');
      setMapError(true);
    };
    
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Remove the global callback
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [latitude, longitude]);

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
