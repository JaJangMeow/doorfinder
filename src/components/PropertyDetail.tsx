import React, { useState, useEffect } from 'react';
import { Building, Home, MapPin, Ruler, Bed, Bath, Calendar, User, Mail, Phone, Coffee, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PropertyMapView from './PropertyMapView';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import PropertyMediaGallery from './property-detail/PropertyMediaGallery';

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
  media?: { url: string; type: 'image' | 'video' }[];
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

  // Convert legacy images array to media format if needed
  const mediaItems = property.media && property.media.length > 0 ? 
    property.media : 
    (property.images?.map(url => ({ url, type: 'image' as const })) || []);

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        if (property.id) {
          const { data: savedData } = await supabase
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

  const hasValidCoordinates = 
    property.latitude !== undefined && 
    property.longitude !== undefined && 
    !isNaN(Number(property.latitude)) && 
    !isNaN(Number(property.longitude)) &&
    Number(property.latitude) !== 0 &&
    Number(property.longitude) !== 0;

  // Ensure coordinates are numbers
  const latitude = hasValidCoordinates ? Number(property.latitude) : 0;
  const longitude = hasValidCoordinates ? Number(property.longitude) : 0;

  // Create a property object for the map view
  const propertyForMap = {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    availableFrom: property.availableFrom,
    imageUrl: property.images && property.images.length > 0 ? property.images[0] : '',
    latitude,
    longitude,
    hasHall: property.hasHall,
    hasSeparateKitchen: property.hasSeparateKitchen
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <PropertyMediaGallery 
            media={mediaItems} 
            title={property.title}
            isSaved={isSaved}
            isLoading={isLoading}
            onSaveToggle={handleSaveProperty}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{property.title}</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSaveProperty}
              disabled={isLoading}
              className="sm:hidden"
            >
              <Heart 
                className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} 
                size={20} 
              />
            </Button>
          </div>
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="mr-2 h-5 w-5" />
            {property.address}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">₹{property.price} / month</span>
              <span className="text-gray-600">
                Available from <Calendar className="inline-block mr-1 h-4 w-4" />
                {new Date(property.availableFrom).toLocaleDateString()}
              </span>
            </div>

            {property.depositAmount && (
              <div className="mt-2 text-gray-700">
                <span className="font-medium">Security Deposit:</span> ₹{property.depositAmount}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center text-gray-700">
                <Bed className="mr-2 h-5 w-5" />
                {property.bedrooms} Bedrooms
              </div>
              <div className="flex items-center text-gray-700">
                <Bath className="mr-2 h-5 w-5" />
                {property.bathrooms} Bathrooms
              </div>
              <div className="flex items-center text-gray-700">
                <Ruler className="mr-2 h-5 w-5" />
                {property.squareFeet} sqft
              </div>
              <div className="flex items-center text-gray-700">
                <Building className="mr-2 h-5 w-5" />
                {property.propertyType === 'pg' ? 'PG Accommodation' : 'Rental'}
              </div>
              {property.floorNumber !== undefined && (
                <div className="flex items-center text-gray-700">
                  <Home className="mr-2 h-5 w-5" />
                  Floor: {property.floorNumber === 0 ? 'Ground Floor' : `${property.floorNumber} floor`}
                </div>
              )}
              {property.genderPreference && property.genderPreference !== 'any' && (
                <div className="flex items-center text-gray-700">
                  <User className="mr-2 h-5 w-5" />
                  Suitable for: {property.genderPreference === 'boys' ? 'Boys' : 'Girls'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Property Description</h2>
            <p className="text-gray-700 mt-2">{property.description}</p>
          </div>

          {property.restrictions && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Restrictions</h2>
              <p className="text-gray-700 mt-2">{property.restrictions}</p>
            </div>
          )}

          {hasValidCoordinates && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <PropertyMapView 
                  properties={[propertyForMap]} 
                  userLocation={null}
                />
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span>{property.contactName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <span>{property.contactEmail}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <span>{property.contactPhone}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={handleContactClick}
            >
              Contact Owner
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Search
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetail;
