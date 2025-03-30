import React, { useState, useEffect } from 'react';
import { Building, Home, MapPin, Ruler, Bed, Bath, Calendar, User, Mail, Phone, Coffee, Heart, Check, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams, Link } from 'react-router-dom';
import GoogleMap from './GoogleMap';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import PropertyMediaGallery from './property-detail/PropertyMediaGallery';
import PropertyMap from './PropertyMap';
import { toast } from 'sonner';

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
  landlord_name: string;
  landlord_phone: string;
  landlord_email: string;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast: useToastToast } = useToast();
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Convert legacy images array to media format if needed
  const mediaItems = property?.media && property.media.length > 0 ? 
    property.media : 
    (property?.images?.map(url => ({ url, type: 'image' as const })) || []);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();
  }, []);

  // Check if property is saved by user
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("saved_properties")
        .select("*")
        .eq("user_id", user.id)
        .eq("property_id", id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error checking saved status:", error);
      }
      
      setIsSaved(!!data);
    };
    
    if (user && id) {
      checkSavedStatus();
    }
  }, [user, id]);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        setProperty(data as PropertyDetailData);
      } catch (error: any) {
        console.error("Error fetching property:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetail();
    }
  }, [id]);

  const handleSaveProperty = async () => {
    if (!user) {
      toast.error("Please sign in to save properties");
      return;
    }

    try {
      if (isSaved) {
        // Delete from saved_properties
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", id);

        if (error) throw error;
        
        setIsSaved(false);
        toast.success("Property removed from favorites");
      } else {
        // Add to saved_properties
        const { error } = await supabase.from("saved_properties").insert({
          user_id: user.id,
          property_id: id,
        });

        if (error) throw error;
        
        setIsSaved(true);
        toast.success("Property saved to favorites");
      }
    } catch (error: any) {
      console.error("Error saving property:", error.message);
      toast.error("Failed to update favorites");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US");
  };

  const hasValidCoordinates = 
    property?.latitude !== undefined && 
    property?.longitude !== undefined && 
    !isNaN(Number(property.latitude)) && 
    !isNaN(Number(property.longitude)) &&
    Number(property.latitude) !== 0 &&
    Number(property.longitude) !== 0;

  // Ensure coordinates are numbers
  const latitude = hasValidCoordinates ? Number(property.latitude) : 0;
  const longitude = hasValidCoordinates ? Number(property.longitude) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-32 w-32 rounded-full bg-primary/20 animate-pulse"></div>
          <div className="h-6 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 animate-fade-in">Property not found</h2>
        <p className="mb-6 animate-fade-in stagger-1">
          The property you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/search">
          <Button className="animate-fade-in stagger-2 btn-hover-effect">
            <ArrowLeft className="mr-2" size={16} />
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <Link to="/search" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors group">
        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
        Back to search results
      </Link>

      <div className="grid md:grid-cols-[2fr,1fr] gap-8">
        <div>
          {/* Image */}
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-6 relative animate-fade-in stagger-1">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-1/4" />

            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={handleSaveProperty}
                className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform hover:scale-105"
                aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
              >
                <Heart size={18} className={`${isSaved ? "fill-primary text-primary" : "text-foreground"}`} />
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }}
                className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform hover:scale-105"
                aria-label="Share property"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Title and Address */}
          <div className="mb-6 animate-fade-in stagger-2">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin size={18} className="mr-2" />
              <span>{property.address}</span>
            </div>

            {/* Key Details */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <Home size={20} className="mr-2 text-primary" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath size={20} className="mr-2 text-primary" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <Calendar size={20} className="mr-2 text-primary" />
                <span>Available from {formatDate(property.availableFrom)}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-primary">${formatPrice(property.price)}</div>
          </div>

          {/* Description */}
          <div className="mb-8 animate-fade-in stagger-3">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <div className="p-6 rounded-xl bg-muted/30">
              <p className="whitespace-pre-line">{property.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8 animate-fade-in stagger-4">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg bg-primary/5 flex items-center ${property.hasHall ? 'opacity-100' : 'opacity-50'}`}>
                {property.hasHall ? (
                  <Check size={20} className="mr-3 text-primary" />
                ) : (
                  <div className="w-5 h-5 mr-3" />
                )}
                <span>Hall</span>
              </div>
              <div className={`p-4 rounded-lg bg-primary/5 flex items-center ${property.hasSeparateKitchen ? 'opacity-100' : 'opacity-50'}`}>
                {property.hasSeparateKitchen ? (
                  <Check size={20} className="mr-3 text-primary" />
                ) : (
                  <div className="w-5 h-5 mr-3" />
                )}
                <span>Separate Kitchen</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mb-8 animate-fade-in stagger-5">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="h-[300px] rounded-xl overflow-hidden border glass">
              {hasValidCoordinates && (
                <PropertyMap
                  latitude={latitude}
                  longitude={longitude}
                  popup={property.address}
                />
              )}
            </div>
          </div>
        </div>

        {/* Contact Landlord Section */}
        <div className="animate-fade-in stagger-6">
          <div className="sticky top-20 glass p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Contact Landlord</h2>
            
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  {property.landlord_name?.charAt(0) || "L"}
                </div>
                <div>
                  <div className="font-medium">{property.landlord_name}</div>
                  <div className="text-sm text-muted-foreground">Property Manager</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {property.landlord_phone && (
                <a 
                  href={`tel:${property.landlord_phone}`}
                  className="flex items-center p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Phone size={18} className="mr-3 text-primary" />
                  <span>{property.landlord_phone}</span>
                </a>
              )}
              
              {property.landlord_email && (
                <a 
                  href={`mailto:${property.landlord_email}?subject=Inquiry about ${property.title}`}
                  className="flex items-center p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Mail size={18} className="mr-3 text-primary" />
                  <span>{property.landlord_email}</span>
                </a>
              )}
            </div>
            
            <Button 
              className="w-full btn-hover-effect" 
              size="lg"
              onClick={() => {
                if (property.landlord_email) {
                  window.location.href = `mailto:${property.landlord_email}?subject=Inquiry about ${property.title}`;
                } else {
                  toast.error("No email address available");
                }
              }}
            >
              Send Message
            </Button>
            
            <div className="mt-2 text-center text-xs text-muted-foreground">
              ID: {property.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
