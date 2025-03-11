
import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';

export const useGoogleMapsScript = () => {
  const [state, setState] = useState({
    loaded: false,
    error: false
  });

  useEffect(() => {
    // If Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setState({ loaded: true, error: false });
      return;
    }

    // If script is already in the document but not loaded yet
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Script exists but hasn't loaded yet
      const handleLoad = () => setState({ loaded: true, error: false });
      const handleError = () => setState({ loaded: false, error: true });
      
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      
      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    // Create and add script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setState({ loaded: true, error: false });
    script.onerror = () => setState({ loaded: false, error: true });
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if component unmounts before script loads
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return state;
};
