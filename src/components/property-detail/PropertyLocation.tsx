
import React from 'react';
import { Button } from '@/components/ui/button';
import GoogleMap from '@/components/GoogleMap';

interface PropertyLocationProps {
  latitude?: number;
  longitude?: number;
  address: string;
}

const PropertyLocation: React.FC<PropertyLocationProps> = ({
  latitude,
  longitude,
  address
}) => {
  const hasValidCoordinates = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(latitude) && 
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  console.log('PropertyLocation - Coordinates check:', { 
    latitude,
    longitude, 
    hasValidCoordinates 
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Location</h2>
      {hasValidCoordinates ? (
        <div className="mt-2 rounded-xl overflow-hidden">
          <GoogleMap latitude={latitude!} longitude={longitude!} />
        </div>
      ) : (
        <div className="mt-2 rounded-xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">Location information not available</p>
            <Button 
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank')}
            >
              Search Address in Google Maps
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;
