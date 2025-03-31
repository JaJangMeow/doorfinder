
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building, Plus, Loader2 } from "lucide-react";
import ListingsGrid from "@/components/my-posts/ListingsGrid";
import LoadingListings from "@/components/my-posts/LoadingListings";
import EmptyListings from "@/components/my-posts/EmptyListings";
import DeleteConfirmationDialog from "@/components/my-posts/DeleteConfirmationDialog";
import { fetchUserListings, deleteUserListing } from "@/services/myPostsService";
import { PropertyData } from "@/components/PropertyCard";

const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your property listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteListing = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteUserListing(propertyToDelete);
      
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
            <h1 className="text-3xl font-bold">My Listings</h1>
            <Link to="/post">
              <Button className="flex items-center gap-2">
                <Plus size={18} />
                <span>Add New</span>
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <LoadingListings />
          ) : listings.length === 0 ? (
            <EmptyListings />
          ) : (
            <ListingsGrid 
              listings={listings} 
              onDeleteClick={(id) => setPropertyToDelete(id)} 
            />
          )}
        </div>
      </div>
      
      <DeleteConfirmationDialog 
        isOpen={!!propertyToDelete}
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
        onConfirm={handleDeleteListing}
      />
      
      <TabBar />
    </div>
  );
};

export default MyListingsPage;
