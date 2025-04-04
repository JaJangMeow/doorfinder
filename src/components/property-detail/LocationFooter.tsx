
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationFooterProps {
  address: string;
  coordinates?: { latitude: number; longitude: number };
}

const LocationFooter: React.FC<LocationFooterProps> = ({ address, coordinates }) => {
  const hasValidCoordinates = coordinates?.latitude && coordinates?.longitude;
  
  return (
    <>
      <div className="mt-3 flex items-start">
        <MapPin className="mt-0.5 mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-muted-foreground">{address}</p>
      </div>
      
      {hasValidCoordinates && (
        <p className="mt-1 ml-7 text-sm text-muted-foreground">
          Coordinates: {coordinates.latitude}, {coordinates.longitude}
        </p>
      )}
    </>
  );
};

export default LocationFooter;
