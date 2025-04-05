
import { useState, useEffect, useRef } from 'react';

interface Property {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  imageUrl: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
}

interface UseGoogleMapProps {
  properties: Property[];
  userLocation: { lat: number; lng: number } | null;
}

const useGoogleMap = ({ properties, userLocation }: UseGoogleMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) return;

      const google = window.google;
      const mapOptions: google.maps.MapOptions = {
        center: userLocation || { lat: 0, lng: 0 },
        zoom: userLocation ? 12 : 2,
        mapTypeId: 'roadmap',
      };

      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    };

    if (window.google) {
      loadMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!map) return;

    const google = window.google;

    const createMarker = (property: Property) => {
      const propertyLatLng = { 
        lat: property.latitude, 
        lng: property.longitude 
      };

      const marker = new google.maps.Marker({
        position: propertyLatLng,
        map: map,
        title: property.title,
      });

      const contentString = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; width: 250px;">
          <img src="${property.imageUrl}" alt="${property.title}" style="width: 100%; height: auto; margin-bottom: 8px;">
          <h3 style="font-size: 1.2em; margin-bottom: 4px;">${property.title}</h3>
          <p style="font-size: 1em; margin-bottom: 4px;">${property.address}</p>
          <p style="font-size: 1.1em; font-weight: bold; margin-bottom: 8px;">₹${property.price}/month</p>
          <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
            <span>Bedrooms: ${property.bedrooms}</span>
            <span>Bathrooms: ${property.bathrooms}</span>
          </div>
          <a href="/property/${property.id}" style="color: #007bff; text-decoration: none;">View Details</a>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      marker.addListener("click", () => {
        infoWindow.open({
          anchor: marker,
          map
        });
      });
      
      return marker;
    };

    const bounds = new google.maps.LatLngBounds();
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = createMarker(property);
        bounds.extend({ 
          lat: property.latitude, 
          lng: property.longitude 
        });
      }
    });

    if (properties.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, properties]);

  return { mapRef };
};

export default useGoogleMap;
