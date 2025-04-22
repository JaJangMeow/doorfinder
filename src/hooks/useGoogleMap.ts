
import { useState } from "react";
import { useGoogleMapCore } from "./map/useGoogleMapCore";
import { useMapMarkers } from "./map/useMapMarkers";
import { useNearbyPlaces } from "./map/useNearbyPlaces";
import { useMapErrorHandling } from "./map/useMapErrorHandling";

// Types (copied from previous code for compatibility)
interface PropertyLocationProps {
  latitude: number;
  longitude: number;
  googleMapsLoaded: boolean;
}
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
type GoogleMapProps = UseGoogleMapProps | PropertyLocationProps;

const useGoogleMap = (props: GoogleMapProps) => {
  // --- Determine mode & setup ---
  const isSingleProperty = "latitude" in props && "longitude" in props;
  const location = isSingleProperty
    ? { lat: props.latitude, lng: props.longitude }
    : (props.userLocation || { lat: 0, lng: 0 });
  const properties = isSingleProperty ? [] : props.properties;
  const googleMapsLoaded = isSingleProperty ? props.googleMapsLoaded : true;

  // --- Map Core, Error, and Markers ---
  const {
    mapRef,
    map,
    isReady,
    error,
    setError,
    setIsReady
  } = useGoogleMapCore({ location, isSingleProperty, googleMapsLoaded });

  useMapMarkers(map, isSingleProperty, location, googleMapsLoaded, properties);

  const { nearbyPlaces, addNearbyPlaces } = useNearbyPlaces(map, isReady);

  const { retryMapInitialization } = useMapErrorHandling(setError, mapRef, location, (m) => {}, setIsReady, isSingleProperty);

  return {
    mapRef,
    map,
    isReady,
    error,
    retryMapInitialization,
    addNearbyPlaces,
    nearbyPlaces
  };
};

export default useGoogleMap;
