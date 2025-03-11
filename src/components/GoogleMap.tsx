
import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

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
  const [mapInitialized, setMapInitialized] = useState(false);

  // Function to initialize the map
  const initializeMap = () => {
    console.log('Attempting to initialize map...', { 
      mapRef: mapRef.current, 
      latitude, 
      longitude,
      scriptLoaded
    });

    if (!mapRef.current) {
      console.error('Map reference is not available yet');
      return;
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      setMapError(true);
      return;
    }

    // Wait for Google Maps to be available
    if (!window.google || !window.google.maps) {
      console.log('Google Maps API not loaded yet, will try again soon');
      setTimeout(initializeMap, 500);
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
      setMapInitialized(true);
      console.log('Map successfully initialized');
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

    // Define the callback for when Google Maps is loaded
    window.initMap = () => {
      console.log('Google Maps script loaded, callback triggered');
      setScriptLoaded(true);
    };

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      return;
    }

    const loadScript = () => {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        console.log('Google Maps script already exists in document');
        setScriptLoaded(true);
        return;
      }

      console.log('Loading Google Maps script...');
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
    };

    loadScript();

    return () => {
      // No cleanup needed, we want the script to remain loaded
    };
  }, [latitude, longitude]);

  // Initialize map when script is loaded and component is mounted
  useEffect(() => {
    if (scriptLoaded && !mapInitialized && mapRef.current) {
      console.log('Script loaded and map ref available, initializing map');
      initializeMap();
    }
  }, [scriptLoaded, mapInitialized]);

  const handleTryAgain = () => {
    console.log('Trying again to load map');
    setMapError(false);
    setMapLoaded(false);
    setMapInitialized(false);
    
    // Short delay to ensure DOM updates before trying again
    setTimeout(() => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        // If Google Maps isn't loaded at all, reload the page
        window.location.reload();
      }
    }, 100);
  };

  const handleOpenInGoogleMaps = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    }
  };

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex flex-col items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground mb-4">Unable to load map. Please check the property location or try again later.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              variant="outline"
              onClick={handleTryAgain}
            >
              Try again
            </Button>
            <Button 
              onClick={handleOpenInGoogleMaps}
            >
              Open in Google Maps
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px]">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-md"
      />
      <Button 
        size="sm"
        variant="secondary"
        className="absolute bottom-4 right-4 shadow-md"
        onClick={handleOpenInGoogleMaps}
      >
        Open in Google Maps
      </Button>
    </div>
  );
};

export default GoogleMap;
