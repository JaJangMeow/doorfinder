
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Building, Plus, Loader2, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyPostsPage: React.FC = () => {
  const [listings, setListings] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setIsLoading(false);
        return;
      }
      
      // Get user's own listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      
      if (listingsError) throw listingsError;
      
      // Transform the data to match PropertyData interface
      const propertyData: PropertyData[] = listingsData.map(item => ({
        id: item.id,
        title: item.title,
        address: item.address,
        price: item.price,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms || 1,
        availableFrom: item.available_from,
        imageUrl: item.images && item.images.length > 0 
          ? item.images[0] 
          : 'https://via.placeholder.com/640x360',
        latitude: item.latitude,
        longitude: item.longitude,
        hasHall: item.has_hall,
        hasSeparateKitchen: item.has_separate_kitchen
      }));
      
      setListings(propertyData);
    } catch (error) {
      console.error('Error fetching your listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your property listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!propertyToDelete) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete);
        
      if (error) throw error;
      
      // Remove from UI
      setListings(prev => prev.filter(prop => prop.id !== propertyToDelete));
      
      toast({
        title: "Property deleted",
        description: "Your property listing has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPropertyToDelete(null);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Posts</h1>
            <Link to="/post">
              <Button className="flex items-center gap-2">
                <Plus size={18} />
                <span>Add New</span>
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 size={48} className="mx-auto animate-spin text-primary opacity-70" />
              <p className="mt-4 text-muted-foreground">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <Building size={48} className="mb-4 opacity-20" />
                <p className="text-lg mb-4">You haven't posted any properties yet</p>
                <Link to="/post">
                  <Button className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add New Property</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((property) => (
                <div key={property.id} className="group relative">
                  <PropertyCard property={property} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPropertyToDelete(property.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your property listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteListing} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <TabBar />
    </div>
  );
};

export default MyPostsPage;
