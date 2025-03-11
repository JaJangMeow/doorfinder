
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const SavedPage: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setIsLoading(false);
        return;
      }
      
      // Get saved properties
      const { data: savedData, error: savedError } = await supabase
        .from('saved_properties')
        .select(`
          property_id,
          saved_at,
          properties(
            id, title, address, price, bedrooms, bathrooms, 
            available_from, images, latitude, longitude,
            has_hall, has_separate_kitchen, nearby_college
          )
        `)
        .eq('user_id', sessionData.session.user.id)
        .order('saved_at', { ascending: false });
      
      if (savedError) throw savedError;
      
      if (!savedData || savedData.length === 0) {
        setSavedProperties([]);
        setIsLoading(false);
        return;
      }
      
      // Transform the data to match PropertyData interface
      // Using a proper type check to ensure properties exist
      const propertyData: PropertyData[] = savedData
        .filter(item => item.properties) // Filter out null properties
        .map(item => {
          // Access properties safely by correctly typing the item
          const property = item.properties as any;
          return {
            id: property.id,
            title: property.title,
            address: property.address,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms || 1,
            availableFrom: property.available_from,
            imageUrl: property.images && property.images.length > 0 
              ? property.images[0] 
              : 'https://via.placeholder.com/640x360',
            latitude: property.latitude,
            longitude: property.longitude,
            hasHall: property.has_hall,
            hasSeparateKitchen: property.has_separate_kitchen
          };
        });
      
      setSavedProperties(propertyData);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      toast({
        title: "Error",
        description: "Failed to load saved properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSaved = async (propertyId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage saved properties.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', sessionData.session.user.id)
        .eq('property_id', propertyId);
        
      if (error) throw error;
      
      // Remove from UI
      setSavedProperties(prev => prev.filter(prop => prop.id !== propertyId));
      
      toast({
        title: "Property removed",
        description: "Property has been removed from your saved list.",
      });
    } catch (error) {
      console.error('Error removing saved property:', error);
      toast({
        title: "Error",
        description: "Failed to remove property. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Saved Properties</h1>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 size={48} className="mx-auto animate-spin text-primary opacity-70" />
              <p className="mt-4 text-muted-foreground">Loading your saved properties...</p>
            </div>
          ) : savedProperties.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <Heart size={48} className="mb-4 opacity-20" />
                <p className="text-lg mb-4">You haven't saved any properties yet</p>
                <Link to="/search">
                  <Button>Explore Properties</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedProperties.map((property) => (
                <div key={property.id} className="group relative">
                  <PropertyCard property={property} />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveSaved(property.id)}
                    className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Heart className="fill-primary text-primary" size={18} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default SavedPage;
