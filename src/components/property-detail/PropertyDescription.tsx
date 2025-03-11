
import React from 'react';

interface PropertyDescriptionProps {
  description: string;
  restrictions?: string;
}

const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  restrictions
}) => {
  return (
    <>
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Property Description</h2>
        <p className="text-gray-700 mt-2">{description}</p>
      </div>

      {restrictions && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Restrictions</h2>
          <p className="text-gray-700 mt-2">{restrictions}</p>
        </div>
      )}
    </>
  );
};

export default PropertyDescription;
