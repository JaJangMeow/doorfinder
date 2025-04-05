
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Home, MapPin, Info, Phone } from 'lucide-react';
import PropertyFeatures from './PropertyFeatures';
import PropertyDescription from './PropertyDescription';
import { PropertyLocation } from './PropertyLocation';
import ContactInformation from './ContactInformation';
import { PropertyDetailData } from './types';

interface PropertyTabsProps {
  property: PropertyDetailData;
  onContactClick: () => void;
}

const PropertyTabs: React.FC<PropertyTabsProps> = ({ property, onContactClick }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger value="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Location</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Contact</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-4 shadow-sm">
          <PropertyFeatures 
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            squareFeet={property.squareFeet}
            propertyType={property.propertyType}
            floorNumber={property.floorNumber}
            genderPreference={property.genderPreference}
          />
        </Card>
        
        <Card className="p-4 shadow-sm">
          <PropertyDescription 
            description={property.description}
            restrictions={property.restrictions}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="details" className="space-y-6">
        <Card className="p-4 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Available From:</span> {new Date(property.availableFrom).toLocaleDateString()}
              </div>
              {property.depositAmount && (
                <div>
                  <span className="font-medium">Security Deposit:</span> ₹{property.depositAmount}
                </div>
              )}
              {property.hasHall !== undefined && (
                <div>
                  <span className="font-medium">Hall:</span> {property.hasHall ? 'Yes' : 'No'}
                </div>
              )}
              {property.hasSeparateKitchen !== undefined && (
                <div>
                  <span className="font-medium">Separate Kitchen:</span> {property.hasSeparateKitchen ? 'Yes' : 'No'}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {property.nearbyCollege && (
                <div>
                  <span className="font-medium">Nearby College:</span> {property.nearbyCollege}
                </div>
              )}
              {property.floorNumber !== undefined && (
                <div>
                  <span className="font-medium">Floor:</span> {property.floorNumber === 0 ? 'Ground Floor' : `${property.floorNumber} floor`}
                </div>
              )}
              {property.genderPreference && (
                <div>
                  <span className="font-medium">Suitable for:</span> {property.genderPreference === 'boys' ? 'Boys' : property.genderPreference === 'girls' ? 'Girls' : 'Anyone'}
                </div>
              )}
            </div>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="location" className="space-y-6">
        <Card className="p-4 shadow-sm">
          <PropertyLocation 
            latitude={property.latitude}
            longitude={property.longitude}
            address={property.address}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="contact" className="space-y-6">
        <Card className="p-4 shadow-sm">
          <ContactInformation 
            contactName={property.contactName}
            contactEmail={property.contactEmail}
            contactPhone={property.contactPhone}
            onContactClick={onContactClick}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
