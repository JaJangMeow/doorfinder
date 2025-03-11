
import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';

export const useGoogleMapsScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Skip if script is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      return;
    }

    // Define the callback for when Google Maps is loaded
    window.initMap = () => {
      console.log('Google Maps script loaded, callback triggered');
      setScriptLoaded(true);
    };

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
        setScriptError(true);
      };
      
      document.head.appendChild(script);
      console.log('Google Maps script added to document head');
    };

    loadScript();
  }, []);

  return { scriptLoaded, scriptError };
};
