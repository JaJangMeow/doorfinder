
import React from 'react';
import { Bed, Bath, Ruler, Building, Home, User } from 'lucide-react';

interface PropertyFeaturesProps {
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType?: 'rental' | 'pg';
  floorNumber?: number;
  genderPreference?: 'boys' | 'girls' | 'any';
}

const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({
  bedrooms,
  bathrooms,
  squareFeet,
  propertyType,
  floorNumber,
  genderPreference
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="flex items-center text-gray-700">
        <Bed className="mr-2 h-5 w-5" />
        {bedrooms} Bedrooms
      </div>
      <div className="flex items-center text-gray-700">
        <Bath className="mr-2 h-5 w-5" />
        {bathrooms} Bathrooms
      </div>
      <div className="flex items-center text-gray-700">
        <Ruler className="mr-2 h-5 w-5" />
        {squareFeet} sqft
      </div>
      <div className="flex items-center text-gray-700">
        <Building className="mr-2 h-5 w-5" />
        {propertyType === 'pg' ? 'PG Accommodation' : 'Rental'}
      </div>
      {floorNumber !== undefined && (
        <div className="flex items-center text-gray-700">
          <Home className="mr-2 h-5 w-5" />
          Floor: {floorNumber === 0 ? 'Ground Floor' : `${floorNumber} floor`}
        </div>
      )}
      {genderPreference && genderPreference !== 'any' && (
        <div className="flex items-center text-gray-700">
          <User className="mr-2 h-5 w-5" />
          Suitable for: {genderPreference === 'boys' ? 'Boys' : 'Girls'}
        </div>
      )}
    </div>
  );
};

export default PropertyFeatures;
