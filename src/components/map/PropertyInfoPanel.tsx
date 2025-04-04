
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, Bath, X, Info } from 'lucide-react';
import { PropertyData } from '@/components/PropertyCard';

interface PropertyInfoPanelProps {
  property: PropertyData;
  onClose: () => void;
}

const PropertyInfoPanel: React.FC<PropertyInfoPanelProps> = ({ property, onClose }) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 max-w-sm bg-white rounded-lg shadow-lg p-4 border border-border/50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{property.title}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="font-semibold text-primary">₹{property.price}</span>
        <span className="flex items-center">
          <Bed size={14} className="mr-1 opacity-70" />
          {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
        </span>
        {property.bathrooms && (
          <span className="flex items-center">
            <Bath size={14} className="mr-1 opacity-70" />
            {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
          </span>
        )}
      </div>
      <Link to={`/property/${property.id}`}>
        <Button className="w-full" variant="default" size="sm">
          <Info size={14} className="mr-1" />
          View Details
        </Button>
      </Link>
    </div>
  );
};

export default PropertyInfoPanel;
