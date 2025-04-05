
import React from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ContactInformation from './ContactInformation';
import { PropertyDetailData } from './types';

interface PropertySidebarProps {
  property: PropertyDetailData;
  onContactClick: () => void;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({
  property,
  onContactClick
}) => {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Quick Info</h3>
        <Separator className="my-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">₹{property.price}/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bedrooms</span>
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bathrooms</span>
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Area</span>
            <span>{property.squareFeet} sqft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{property.propertyType === 'pg' ? 'PG Accommodation' : 'Rental'}</span>
          </div>
        </div>
        <Separator className="my-3" />
        <ContactInformation 
          contactName={property.contactName}
          contactEmail={property.contactEmail}
          contactPhone={property.contactPhone}
          onContactClick={onContactClick}
          compact={true}
        />
      </Card>
      
      {property.nearbyCollege && (
        <Card className="p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Nearby College</h3>
          <p>{property.nearbyCollege}</p>
        </Card>
      )}
    </div>
  );
};

export default PropertySidebar;
