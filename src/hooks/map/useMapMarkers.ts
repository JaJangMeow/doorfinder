
import { useRef, useEffect } from "react";

export function useMapMarkers(map: google.maps.Map | null, isSingleProperty: boolean, location: { lat: number; lng: number }, googleMapsLoaded: boolean, properties: any[]) {
  const markers = useRef<google.maps.Marker[]>([]);

  // Add marker for single property view
  useEffect(() => {
    if (!map || !isSingleProperty || !(window.google && window.google.maps)) return;
    if (location.lat === 0 && location.lng === 0) return;

    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      animation: window.google.maps.Animation.DROP,
    });

    markers.current.push(marker);

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
    // eslint-disable-next-line
  }, [map, isSingleProperty, location.lat, location.lng, googleMapsLoaded]);

  // Multiple property markers
  useEffect(() => {
    if (!map || isSingleProperty || properties.length === 0 || !window.google || !window.google.maps) return;
    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    const bounds = new window.google.maps.LatLngBounds();

    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      const propertyLatLng = { lat: property.latitude, lng: property.longitude };
      const marker = new window.google.maps.Marker({
        position: propertyLatLng,
        map: map,
        title: property.title,
      });
      markers.current.push(marker);

      // Info window content
      const contentString = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; width: 250px;">
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

      const infoWindow = new window.google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener("click", () => {
        infoWindow.open({ anchor: marker, map });
      });
      bounds.extend(propertyLatLng);
    });

    if (properties.length > 0) {
      map.fitBounds(bounds);
    }
    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, [map, properties, isSingleProperty]);

  return { markers };
}
