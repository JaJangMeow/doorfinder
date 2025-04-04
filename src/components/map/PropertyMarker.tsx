
import React from 'react';
import mapboxgl from 'mapbox-gl';
import { PropertyData } from '@/components/PropertyCard';

interface PropertyMarkerProps {
  map: mapboxgl.Map;
  property: PropertyData;
  onClick: (property: PropertyData) => void;
}

const PropertyMarker = ({ map, property, onClick }: PropertyMarkerProps) => {
  if (!property.latitude || !property.longitude) return null;
  
  React.useEffect(() => {
    try {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'property-marker';
      markerEl.innerHTML = `
        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer">
          <span class="text-xs font-bold">₹${property.price}</span>
        </div>
      `;
      
      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'bottom'
      })
      .setLngLat([property.longitude, property.latitude])
      .addTo(map);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        onClick(property);
      });
      
      return () => {
        marker.remove();
      };
    } catch (error) {
      console.error(`Error adding marker for property ${property.id}:`, error);
      return undefined;
    }
  }, [map, property, onClick]);
  
  return null; // This is a non-rendering component
};

export default PropertyMarker;
