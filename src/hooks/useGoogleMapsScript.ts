
import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';

export const useGoogleMapsScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Check if Google Maps API is already available in window
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded in window object');
      setScriptLoaded(true);
      return;
    }

    // Check if the script tag is already in the document but still loading
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Google Maps script tag already exists');
      
      // If script exists but Google Maps isn't available yet, wait for it to load
      const checkIfLoaded = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API detected after checking');
          setScriptLoaded(true);
          return true;
        }
        return false;
      };

      if (!checkIfLoaded()) {
        existingScript.addEventListener('load', () => {
          console.log('Existing Google Maps script loaded');
          setScriptLoaded(true);
        });
        
        existingScript.addEventListener('error', (e) => {
          console.error('Error loading existing Google Maps script:', e);
          setScriptError(true);
        });
      }
      
      return;
    }

    // If no script tag exists, create and add it to the document
    console.log('Creating new Google Maps script tag');
    const newScript = document.createElement('script');
    newScript.id = 'google-maps-script';
    newScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    newScript.async = true;
    newScript.defer = true;
    
    newScript.onload = () => {
      console.log('New Google Maps script loaded successfully');
      setScriptLoaded(true);
    };
    
    newScript.onerror = (e) => {
      console.error('Failed to load new Google Maps script:', e);
      setScriptError(true);
    };
    
    document.head.appendChild(newScript);
    console.log('Added new Google Maps script to document head');
  }, []);

  return { scriptLoaded, scriptError };
};
