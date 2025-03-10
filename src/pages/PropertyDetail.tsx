
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PropertyDetailComponent from "@/components/PropertyDetail";
import { getPropertyById } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";
import TabBar from "@/components/TabBar";
import Navbar from "@/components/Navbar";
import { GOOGLE_MAPS_API_KEY } from "@/lib/supabase";

// Define a global interface to make TypeScript aware of the google property
declare global {
  interface Window {
    google: any;
  }
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => id ? getPropertyById(id) : null,
    enabled: !!id,
  });

  // Load Google Maps script
  React.useEffect(() => {
    // Check if Google Maps script is already loaded
    if (typeof window.google === 'undefined' && property?.latitude && property?.longitude) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        // Clean up the script when the component unmounts
        document.head.removeChild(script);
      };
    }
  }, [property]);

  // Show error toast if needed
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-2xl mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-10 bg-muted animate-pulse rounded mb-4 w-3/4" />
                <div className="h-6 bg-muted animate-pulse rounded mb-6 w-1/2" />
                <div className="h-40 bg-muted animate-pulse rounded" />
              </div>
              <div>
                <div className="h-64 bg-muted animate-pulse rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  // Handle missing ID or property not found
  if (!id || !property) {
    return (
      <div className="min-h-screen pb-16">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground">
              {!id ? "The property ID is missing." : `We couldn't find a property with ID: ${id}`}
            </p>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <PropertyDetailComponent property={property} />
      </div>
      <TabBar />
    </div>
  );
};

export default PropertyDetailPage;
