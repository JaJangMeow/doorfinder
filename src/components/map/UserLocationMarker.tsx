
import React from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map;
  userLocation: { lat: number; lng: number };
}

const UserLocationMarker = ({ map, userLocation }: UserLocationMarkerProps) => {
  React.useEffect(() => {
    try {
      // Create user location marker
      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'user-location-marker';
      userMarkerEl.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `;
      
      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: userMarkerEl,
        anchor: 'center'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
      
      return () => {
        marker.remove();
      };
    } catch (error) {
      console.error("Error adding user location marker:", error);
      return undefined;
    }
  }, [map, userLocation]);
  
  return null; // This is a non-rendering component
};

export default UserLocationMarker;
