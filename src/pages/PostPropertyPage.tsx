
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import { ArrowRight } from "lucide-react";
import { Coordinates, MediaItem } from "@/types/property";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { submitProperty } from "@/services/propertySubmitService";
import PropertyDetailsForm from "@/components/property/PropertyDetailsForm";
import PropertyMediaForm from "@/components/property/PropertyMediaForm";
import ContactInformationForm from "@/components/property/ContactInformationForm";
import PropertyFormSteps from "@/components/property/PropertyFormSteps";

const PostPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 12.9716, lng: 77.5946 });
  const [media, setMedia] = useState<MediaItem[]>([]);
  
  const {
    formData,
    formStep,
    handleChange,
    handleCheckboxChange,
    handleSelectChange,
    nextStep,
    prevStep,
    validateFormStep,
  } = usePropertyForm();

  const handleLocationSelect = (coords: Coordinates) => {
    console.log("Selected coordinates:", coords);
    setCoordinates(coords);
  };

  const handleMediaChange = (newMedia: MediaItem[]) => {
    setMedia(newMedia);
  };

  const validateMediaStep = () => {
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
  };

  const validateContactStep = () => {
    if (!formData.contact_name.trim()) {
      toast({
        title: "Missing contact name",
        description: "Please provide your name",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.contact_email.trim() || !/^\S+@\S+\.\S+$/.test(formData.contact_email)) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.contact_phone.trim()) {
      toast({
        title: "Missing phone number",
        description: "Please provide your phone number",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleStepValidation = () => {
    if (formStep === 1) {
      return validateFormStep(1);
    } else if (formStep === 2) {
      return validateMediaStep();
    } else if (formStep === 3) {
      return validateContactStep();
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!handleStepValidation()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Submitting property with coordinates:", coordinates);
      console.log("Uploading media:", media);
      console.log("Form data:", formData);

      await submitProperty(formData, coordinates, media);
      
      toast({
        title: "Success!",
        description: "Your property has been posted successfully.",
      });
      
      navigate('/search');
    } catch (error: any) {
      console.error('Error posting property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch(formStep) {
      case 1:
        return (
          <PropertyDetailsForm 
            formData={formData}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectChange={handleSelectChange}
          />
        );
        
      case 2:
        return (
          <PropertyMediaForm
            media={media}
            coordinates={coordinates}
            onMediaChange={handleMediaChange}
            onLocationSelect={handleLocationSelect}
          />
        );
        
      case 3:
        return (
          <ContactInformationForm
            formData={formData}
            media={media}
            handleChange={handleChange}
          />
        );
        
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
          
          <PropertyFormSteps formStep={formStep} />
          
          <form onSubmit={formStep === 3 ? handleSubmit : e => { e.preventDefault(); nextStep(); }}>
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
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default PostPropertyPage;
