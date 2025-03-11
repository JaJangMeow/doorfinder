
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PropertyImageGallery from './PropertyImageGallery';
import PropertyHeader from './PropertyHeader';
import PropertyFeatures from './PropertyFeatures';
import PropertyDescription from './PropertyDescription';
import ContactInformation from './ContactInformation';
import PropertyLocation from './PropertyLocation';

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

const PropertyDetail: React.FC<{ property: PropertyDetailData }> = ({ property }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <PropertyImageGallery 
            images={property.images} 
            title={property.title}
            isSaved={isSaved}
            isLoading={isLoading}
            onSaveToggle={handleSaveProperty}
          />
        </div>

        <div>
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
          
          <PropertyFeatures 
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            squareFeet={property.squareFeet}
            propertyType={property.propertyType}
            floorNumber={property.floorNumber}
            genderPreference={property.genderPreference}
          />
          
          <PropertyDescription 
            description={property.description}
            restrictions={property.restrictions}
          />
          
          <ContactInformation 
            contactName={property.contactName}
            contactEmail={property.contactEmail}
            contactPhone={property.contactPhone}
            onContactClick={handleContactClick}
          />
        </div>
      </div>

      <PropertyLocation 
        latitude={property.latitude}
        longitude={property.longitude}
        address={property.address}
      />

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Search
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetail;
