
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import PropertyMediaGallery from './PropertyMediaGallery';
import PropertyHeader from './PropertyHeader';
import PropertyTabs from './PropertyTabs';
import PropertySidebar from './PropertySidebar';
import PropertyBreadcrumb from './PropertyBreadcrumb';
import { setupSupabaseStorage } from '@/lib/supabase-setup';
import { PropertyDetailData, MediaItem } from './types';

export const PropertyDetail: React.FC<{ property: PropertyDetailData }> = ({ property }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setupSupabaseStorage();
  }, []);

  // --------- FORCE DARK MODE ON MOBILE ---------
  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" &&
      ((/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(window.navigator.userAgent)) ||
        window.innerWidth <= 800);
    if (isMobile) {
      document.documentElement.classList.add('dark');
    }
    // Optionally, clean up if necessary
    // return () => {
    //   document.documentElement.classList.remove('dark');
    // };
  }, []);
  // ---------------------------------------------

  const createFallbackMedia = (): MediaItem[] => {
    return [{
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      type: 'image'
    }];
  };

  const mediaItems: MediaItem[] = 
    property.media && property.media.length > 0 ? property.media : 
    property.images && property.images.length > 0 ? property.images.map(url => ({ url, type: 'image' as const })) : 
    createFallbackMedia();

  console.log('Property media items:', mediaItems);

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
    // now not used, we show copy phone button
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
    <div className="container mx-auto px-4 md:px-6 py-6">
      <PropertyBreadcrumb propertyTitle={property.title} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {/* HEIGHT BUMPED here: */}
          <div className="mb-6">
            <PropertyMediaGallery 
              media={mediaItems} 
              title={property.title}
              isSaved={isSaved}
              isLoading={isLoading}
              onSaveToggle={handleSaveProperty}
            />
          </div>
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
          <div className="mt-6">
            <PropertyTabs 
              property={property}
              onContactClick={handleContactClick}
            />
          </div>
        </div>
        <div className="lg:col-span-4">
          <PropertySidebar
            property={property}
            onContactClick={handleContactClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
