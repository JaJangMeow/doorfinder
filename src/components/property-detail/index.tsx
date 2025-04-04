
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import PropertyMediaGallery from './PropertyMediaGallery';
import PropertyHeader from './PropertyHeader';
import PropertyFeatures from './PropertyFeatures';
import PropertyDescription from './PropertyDescription';
import ContactInformation from './ContactInformation';
import { PropertyLocation } from './PropertyLocation'; // Fixed import to use named import
import { setupSupabaseStorage } from '@/lib/supabase-setup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, MapPin, Info, Phone } from 'lucide-react';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface PropertyDetailData {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  availableFrom: string;
  description: string;
  images: string[];
  media?: MediaItem[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  latitude?: number;
  longitude?: number;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
  nearbyCollege?: string;
  propertyType?: 'rental' | 'pg';
  genderPreference?: 'boys' | 'girls' | 'any';
  floorNumber?: number;
  depositAmount?: number;
  restrictions?: string;
}

export const PropertyDetail: React.FC<{ property: PropertyDetailData }> = ({ property }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setupSupabaseStorage();
  }, []);

  const createFallbackMedia = (): MediaItem[] => {
    return [{
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      type: 'image'
    }];
  };

  const mediaItems: MediaItem[] = 
    property.media && property.media.length > 0 ? property.media : 
    property.images && property.images.length > 0 ? property.images.map(url => ({ url, type: 'image' as const })) : 
    createFallbackMedia();

  console.log('Property media items:', mediaItems);

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        if (property.id) {
          const { data: savedData, error } = await supabase
            .from('saved_properties')
            .select('*')
            .eq('user_id', data.session.user.id)
            .eq('property_id', property.id)
            .maybeSingle();
          
          if (savedData) {
            setIsSaved(true);
          }
        }
      }
    };
    
    checkAuthentication();
  }, [property.id]);

  const handleContactClick = () => {
    window.location.href = `mailto:${property.contactEmail}?subject=Inquiry about ${property.title}`;
  };

  const handleSaveProperty = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save properties.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', property.id);
          
        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Property removed",
          description: "Property has been removed from your saved list.",
        });
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({
            user_id: userId,
            property_id: property.id,
            saved_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Property saved",
          description: "Property has been added to your saved list.",
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving property:', error);
      toast({
        title: "Error",
        description: "Failed to update saved properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <PropertyMediaGallery 
            media={mediaItems} 
            title={property.title}
            isSaved={isSaved}
            isLoading={isLoading}
            onSaveToggle={handleSaveProperty}
          />
          
          <div className="mt-6">
            <PropertyHeader 
              title={property.title}
              address={property.address}
              price={property.price}
              availableFrom={property.availableFrom}
              depositAmount={property.depositAmount}
              isSaved={isSaved}
              isLoading={isLoading}
              onSaveToggle={handleSaveProperty}
            />
          </div>
          
          <div className="mt-6">
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
                    onContactClick={handleContactClick}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:col-span-4">
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
                onContactClick={handleContactClick}
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
        </div>
      </div>
    </div>
  );
};

export * from './PropertyDescription';
export * from './PropertyFeatures';
export * from './PropertyHeader';
export * from './PropertyMediaGallery';
export * from './ContactInformation';
export * from './MapHeader';
export * from './MapTabContent';
export * from './SatelliteTabContent';
export * from './StreetViewTabContent';
export * from './NoLocationState';
export * from './LocationFooter';
export * from './MapErrorState';
export { PropertyLocation } from './PropertyLocation';
