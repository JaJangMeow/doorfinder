
import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';

export const useGoogleMapsScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      return;
    }

    const script = document.getElementById('google-maps-script');
    if (script) {
      console.log('Script tag exists, waiting for load');
      setScriptLoaded(true);
      return;
    }

    console.log('Loading Google Maps script...');
    const newScript = document.createElement('script');
    newScript.id = 'google-maps-script';
    newScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    newScript.async = true;
    newScript.defer = true;
    
    newScript.onload = () => {
      console.log('Google Maps script loaded');
      setScriptLoaded(true);
    };
    
    newScript.onerror = (e) => {
      console.error('Google Maps script failed to load:', e);
      setScriptError(true);
    };
    
    document.head.appendChild(newScript);
  }, []);

  return { scriptLoaded, scriptError };
};
