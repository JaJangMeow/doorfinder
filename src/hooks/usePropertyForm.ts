
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PropertyFormData } from "@/types/property";

export const usePropertyForm = () => {
  const { toast } = useToast();
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    address: '',
    price: '',
    bedrooms: '1',
    bathrooms: '1',
    square_feet: '500',
    description: '',
    available_from: new Date().toISOString().split('T')[0],
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    has_hall: false,
    has_separate_kitchen: false,
    nearby_college: '',
    floor_number: '0',
    property_type: 'rental',
    gender_preference: 'any',
    restrictions: '',
    deposit_amount: ''
  });

  const validateFormStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast({
          title: "Missing title",
          description: "Please provide a title for your listing",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.address.trim()) {
        toast({
          title: "Missing address",
          description: "Please provide the property address",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
        toast({
          title: "Invalid price",
          description: "Please provide a valid price",
          variant: "destructive",
        });
        return false;
      }
      if (formData.deposit_amount && isNaN(parseFloat(formData.deposit_amount))) {
        toast({
          title: "Invalid deposit amount",
          description: "Please provide a valid deposit amount",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.nearby_college.trim()) {
        toast({
          title: "Missing nearby college",
          description: "Please specify a nearby college or university",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (validateFormStep(formStep)) {
      setFormStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  return {
    formData,
    formStep,
    setFormData,
    handleChange,
    handleCheckboxChange,
    handleSelectChange,
    nextStep,
    prevStep,
    validateFormStep,
  };
};
