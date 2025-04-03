
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import the components we created
import PropertyDetailsForm from "@/components/post-property/PropertyDetailsForm";
import MediaLocationForm from "@/components/post-property/MediaLocationForm";
import ContactInfoForm from "@/components/post-property/ContactInfoForm";
import ProgressIndicator from "@/components/post-property/ProgressIndicator";
import { propertyFormSchema, PropertyFormValues, defaultValues, popularColleges } from "@/components/post-property/PostPropertySchema";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

const PostPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 12.9716, lng: 77.5946 });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [formStep, setFormStep] = useState(1);
  
  // Use react-hook-form with zod validation
  const methods = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
    mode: "onChange"
  });

  const { handleSubmit, watch, formState: { errors, isValid } } = methods;

  // Watch form values for validation
  const formValues = watch();

  const handleLocationSelect = (coords: Coordinates) => {
    console.log("Selected coordinates:", coords);
    setCoordinates(coords);
  };

  const handleMediaChange = (newMedia: MediaItem[]) => {
    setMedia(newMedia);
  };

  const validateStep = () => {
    if (formStep === 1) {
      const fieldsToValidate = [
        'title', 'address', 'price', 'nearby_college', 
        'property_type', 'gender_preference'
      ];
      
      const hasErrors = fieldsToValidate.some(field => !!errors[field as keyof PropertyFormValues]);
      
      if (hasErrors) {
        // Display error toast for missing fields
        toast({
          title: "Please check your inputs",
          description: "Some required fields are missing or invalid",
          variant: "destructive",
        });
        return false;
      }
      
      if (formValues.deposit_amount && isNaN(parseFloat(formValues.deposit_amount))) {
        toast({
          title: "Invalid deposit amount",
          description: "Please provide a valid deposit amount",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    }
    
    if (formStep === 2) {
      if (media.length === 0) {
        toast({
          title: "Image or video required",
          description: "Please upload at least one image or video of the property",
          variant: "destructive",
        });
        return false;
      }
      if (!coordinates.lat || !coordinates.lng) {
        toast({
          title: "Location required",
          description: "Please set the property location on the map",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    
    if (formStep === 3) {
      const contactFields = ['contact_name', 'contact_email', 'contact_phone'];
      const hasContactErrors = contactFields.some(field => !!errors[field as keyof PropertyFormValues]);
      
      if (hasContactErrors) {
        toast({
          title: "Please check your contact information",
          description: "Some required contact fields are missing or invalid",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setFormStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: PropertyFormValues) => {
    if (!validateStep()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const numericPrice = parseFloat(data.price);
      const numericBedrooms = parseInt(data.bedrooms);
      const numericBathrooms = parseInt(data.bathrooms);
      const numericSquareFeet = parseInt(data.square_feet);
      const numericFloorNumber = parseInt(data.floor_number);
      const numericDepositAmount = data.deposit_amount ? parseFloat(data.deposit_amount) : null;
      
      console.log("Submitting property with coordinates:", coordinates);
      console.log("Uploading media:", media);
      console.log("Form data:", data);

      if (!data.title || !data.address || isNaN(numericPrice) || !coordinates.lat || !coordinates.lng) {
        throw new Error("Required fields are missing");
      }

      if (media.length === 0) {
        throw new Error("At least one image or video is required");
      }

      const mainImageUrl = media.find(item => item.type === 'image')?.url || media[0].url;

      const { data: responseData, error } = await supabase
        .from('properties')
        .insert([
          {
            title: data.title,
            address: data.address,
            price: numericPrice,
            bedrooms: numericBedrooms,
            bathrooms: numericBathrooms,
            square_feet: numericSquareFeet,
            description: data.description,
            available_from: data.available_from,
            image_url: mainImageUrl,
            media: media,
            contact_name: data.contact_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            has_hall: data.has_hall,
            has_separate_kitchen: data.has_separate_kitchen,
            nearby_college: data.nearby_college || "Not specified",
            floor_number: numericFloorNumber,
            property_type: data.property_type,
            gender_preference: data.gender_preference,
            restrictions: data.restrictions,
            deposit_amount: numericDepositAmount,
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      toast({
        title: "Success!",
        description: "Your property has been posted successfully.",
      });
      
      navigate('/search');
    } catch (error: unknown) {
      console.error('Error posting property:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to post property. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch(formStep) {
      case 1:
        return <PropertyDetailsForm methods={methods} popularColleges={popularColleges} />;
      case 2:
        return (
          <MediaLocationForm 
            media={media}
            onMediaChange={handleMediaChange}
            coordinates={coordinates}
            onLocationSelect={handleLocationSelect}
          />
        );
      case 3:
        return <ContactInfoForm methods={methods} formValues={formValues} media={media} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Post Your Student Housing</h1>
          <p className="text-muted-foreground mb-6">
            Help other students find housing near your college campus.
          </p>
          
          <ProgressIndicator currentStep={formStep} totalSteps={3} />
          
          <FormProvider {...methods}>
            <form onSubmit={formStep === 3 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); nextStep(); }}>
              {renderStepContent()}
              
              <div className="flex justify-between mt-6">
                {formStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                )}
                
                <div className="ml-auto">
                  {formStep < 3 ? (
                    <Button type="submit">
                      Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Property"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default PostPropertyPage;
