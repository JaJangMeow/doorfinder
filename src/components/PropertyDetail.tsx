import React, { useState, useEffect } from 'react';
import { Building, Home, MapPin, Ruler, Bed, Bath, Calendar, User, Mail, Phone, Coffee, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import GoogleMap from './GoogleMap';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

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

  const hasValidCoordinates = 
    property.latitude !== undefined && 
    property.longitude !== undefined && 
    !isNaN(property.latitude) && 
    !isNaN(property.longitude);

  console.log('Property coordinates:', { 
    latitude: property.latitude, 
    longitude: property.longitude,
    hasValidCoordinates
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative h-96 rounded-xl overflow-hidden">
            <img
              src={property.images[0] || 'https://via.placeholder.com/640x360'}
              alt={property.title}
              className="object-cover w-full h-full"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSaveProperty}
              disabled={isLoading}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Heart 
                className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} 
                size={20} 
              />
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {property.images.slice(1, 4).map((image, index) => (
              <div key={index} className="relative h-32 rounded-xl overflow-hidden">
                <img
                  src={image || 'https://via.placeholder.com/640x360'}
                  alt={`${property.title} - Image ${index + 2}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
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

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <div className="mt-2">
              <div className="flex items-center text-gray-700">
                <User className="mr-2 h-5 w-5" />
                {property.contactName}
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="mr-2 h-5 w-5" />
                {property.contactEmail}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="mr-2 h-5 w-5" />
                {property.contactPhone}
              </div>
            </div>
            <Button className="mt-4" onClick={handleContactClick}>
              Contact Owner
            </Button>
          </div>
        </div>
      </div>

      {hasValidCoordinates ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="mt-2 rounded-xl overflow-hidden">
            <GoogleMap latitude={property.latitude!} longitude={property.longitude!} />
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="mt-2 rounded-xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Location information not available</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Search
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetail;
