import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Home, MapPin, Bed, Bath, Phone, Mail, User, Building, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  latitude: number | null;
  longitude: number | null;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
}

interface PropertyDetailProps {
  property: PropertyDetailData;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const { toast } = useToast();
  const mapRef = React.useRef<HTMLDivElement>(null);
  
  // Initialize Google Map when component mounts
  React.useEffect(() => {
    if (mapRef.current && property.latitude && property.longitude && window.google?.maps) {
      const location = { lat: property.latitude, lng: property.longitude };
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
      });
      
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: property.title,
      });
    }
  }, [property, mapRef.current, window.google?.maps]);
  
  const handleContactClick = (method: 'email' | 'phone') => {
    const action = method === 'email' ? 'Email copied' : 'Phone number copied';
    const value = method === 'email' ? property.contactEmail : property.contactPhone;
    
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: action,
        description: `The ${method} has been copied to your clipboard.`,
      });
    });
  };

  // Format the available date
  const formattedDate = new Date(property.availableFrom).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate the number of months since the property was posted
  const monthsAgo = 1; // This would be calculated from createdAt if available
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="relative rounded-2xl overflow-hidden h-96 mb-6">
          <div className="absolute inset-0 flex">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home size={64} className="text-muted-foreground opacity-20" />
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <Badge variant="outline" className="text-md py-1 px-3">
                ₹{property.price.toLocaleString('en-IN')}/mo
              </Badge>
            </div>
            
            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin size={16} className="mr-1" />
              <span>{property.address}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <Bed size={20} className="mr-1 text-primary" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath size={20} className="mr-1 text-primary" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <Building size={20} className="mr-1 text-primary" />
                <span>{property.squareFeet} sq ft</span>
              </div>
              <div className="flex items-center">
                <Calendar size={20} className="mr-1 text-primary" />
                <span>Available: {formattedDate}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">About this property</h2>
              <div className="whitespace-pre-line text-muted-foreground">
                {property.description}
              </div>
            </div>
            
            {property.latitude && property.longitude && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div 
                  ref={mapRef} 
                  className="h-64 rounded-lg bg-muted"
                ></div>
              </div>
            )}
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Property Manager</h2>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{property.contactName.charAt(0)}</AvatarFallback>
                    <AvatarImage src="" alt={property.contactName} />
                  </Avatar>
                  <div>
                    <p className="font-medium">{property.contactName}</p>
                    <p className="text-sm text-muted-foreground">Listed {monthsAgo} month ago</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Mail size={18} className="mr-2 text-muted-foreground" />
                  <span className="text-sm">{property.contactEmail}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={18} className="mr-2 text-muted-foreground" />
                  <span className="text-sm">{property.contactPhone}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => handleContactClick('email')} 
                  className="w-full"
                >
                  Copy Email
                </Button>
                <Button 
                  onClick={() => handleContactClick('phone')} 
                  variant="outline" 
                  className="w-full"
                >
                  Copy Phone
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
