
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as PropertyDetailComponents from "@/components/property-detail";
import { getPropertyById } from "@/services/propertyService";
import { useToast } from "@/hooks/use-toast";
import TabBar from "@/components/TabBar";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => id ? getPropertyById(id) : null,
    enabled: !!id,
    // Configure staleTime to improve performance by reducing refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('PropertyDetailPage - Property data loaded:', property);

  // Show error toast if needed
  React.useEffect(() => {
    if (error) {
      console.error('Error loading property:', error);
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
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading property details...</p>
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
          <div className="max-w-md mx-auto bg-muted/30 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {!id ? "The property ID is missing." : `We couldn't find a property with ID: ${id}`}
            </p>
            <p className="text-muted-foreground">
              Please try searching for properties again from the browse page.
            </p>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  // Process property data for display
  const processedProperty = {
    ...property,
    latitude: property.latitude && typeof property.latitude !== 'undefined' ? 
      Number(property.latitude) : undefined,
    longitude: property.longitude && typeof property.longitude !== 'undefined' ? 
      Number(property.longitude) : undefined
  };

  // Check if coordinates are valid for debug purposes
  const hasValidCoordinates = 
    processedProperty.latitude !== undefined && 
    processedProperty.longitude !== undefined && 
    !isNaN(processedProperty.latitude) && 
    !isNaN(processedProperty.longitude);

  console.log('PropertyDetailPage - Property coordinates:', { 
    latitude: processedProperty.latitude, 
    longitude: processedProperty.longitude,
    hasValidCoordinates
  });

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Use the named export component */}
        <PropertyDetailComponents.PropertyLocation 
          latitude={processedProperty.latitude}
          longitude={processedProperty.longitude}
          address={processedProperty.address}
        />
      </div>
      <TabBar />
    </div>
  );
};

export default PropertyDetailPage;
