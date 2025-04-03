
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import LocationPicker from "@/components/LocationPicker";
import MediaUploader from "@/components/MediaUploader";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, Home, Calendar, User, 
  Mail, Phone, Upload, Image, 
  Check, ArrowRight, Bath, Coffee, Building, User2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm, FormProvider } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

// Define the form schema with Zod
const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  address: z.string().min(1, "Address is required"),
  price: z.string().min(1, "Price is required"),
  bedrooms: z.string(),
  bathrooms: z.string(),
  square_feet: z.string(),
  description: z.string().optional(),
  available_from: z.string(),
  nearby_college: z.string().min(1, "Nearby college is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Invalid email format"),
  contact_phone: z.string().min(1, "Phone number is required"),
  has_hall: z.boolean().default(false),
  has_separate_kitchen: z.boolean().default(false),
  floor_number: z.string(),
  property_type: z.enum(["rental", "pg"]),
  gender_preference: z.enum(["boys", "girls", "any"]),
  restrictions: z.string().optional(),
  deposit_amount: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

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
    defaultValues: {
      title: "",
      address: "",
      price: "",
      bedrooms: "2",
      bathrooms: "1",
      square_feet: "800",
      description: "",
      available_from: new Date().toISOString().split('T')[0],
      nearby_college: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      has_hall: false,
      has_separate_kitchen: false,
      floor_number: "0",
      property_type: "rental",
      gender_preference: "any",
      restrictions: "",
      deposit_amount: "",
    },
    mode: "onChange"
  });

  const { handleSubmit, watch, setValue, formState: { errors, isValid } } = methods;

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

  const popularColleges = [
    "Bangalore University",
    "Indian Institute of Science (IISc)",
    "Christ University",
    "Kristu Jayanti College",
    "Mount Carmel College",
    "St. Joseph's College",
    "Ramaiah Institute of Technology",
    "PES University",
    "Jain University",
    "BMS College of Engineering",
    "RV College of Engineering",
    "MS Ramaiah Medical College",
  ];

  const renderStepContent = () => {
    switch(formStep) {
      case 1:
        return (
          <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Home className="mr-2 text-primary" size={20} />
              Property Details
            </h2>
            
            <div className="space-y-4">
              <FormField
                control={methods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Cozy 2BR Apartment near KJC"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 123 College St, Bangalore"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g., 15000"
                          {...field}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={methods.control}
                  name="deposit_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g., 30000"
                          {...field}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${field.value === 'rental' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                        <input
                          type="radio"
                          value="rental"
                          checked={field.value === 'rental'}
                          onChange={() => field.onChange('rental')}
                          className="sr-only"
                        />
                        <Building className="mr-2" size={18} />
                        Rental
                      </label>
                      
                      <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${field.value === 'pg' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                        <input
                          type="radio"
                          value="pg"
                          checked={field.value === 'pg'}
                          onChange={() => field.onChange('pg')}
                          className="sr-only"
                        />
                        <User2 className="mr-2" size={18} />
                        PG Accommodation
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="gender_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Preference</FormLabel>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'boys' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                        <input
                          type="radio"
                          value="boys"
                          checked={field.value === 'boys'}
                          onChange={() => field.onChange('boys')}
                          className="sr-only"
                        />
                        Boys Only
                      </label>
                      
                      <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'girls' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                        <input
                          type="radio"
                          value="girls"
                          checked={field.value === 'girls'}
                          onChange={() => field.onChange('girls')}
                          className="sr-only"
                        />
                        Girls Only
                      </label>
                      
                      <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'any' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                        <input
                          type="radio"
                          value="any"
                          checked={field.value === 'any'}
                          onChange={() => field.onChange('any')}
                          className="sr-only"
                        />
                        No Preference
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={methods.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={methods.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Bathroom</SelectItem>
                          <SelectItem value="2">2 Bathrooms</SelectItem>
                          <SelectItem value="3">3 Bathrooms</SelectItem>
                          <SelectItem value="4">4+ Bathrooms</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={methods.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Ground Floor</SelectItem>
                          <SelectItem value="1">1st Floor</SelectItem>
                          <SelectItem value="2">2nd Floor</SelectItem>
                          <SelectItem value="3">3rd Floor</SelectItem>
                          <SelectItem value="4">4th Floor</SelectItem>
                          <SelectItem value="5">5th Floor</SelectItem>
                          <SelectItem value="6">6th Floor or higher</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={methods.control}
                name="square_feet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="500">Under 500 sq ft</SelectItem>
                        <SelectItem value="800">500-800 sq ft</SelectItem>
                        <SelectItem value="1000">800-1000 sq ft</SelectItem>
                        <SelectItem value="1500">1000-1500 sq ft</SelectItem>
                        <SelectItem value="2000">1500+ sq ft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Additional Features</Label>
                <div className="flex flex-wrap gap-4 mt-1">
                  <FormField
                    control={methods.control}
                    name="has_hall"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_hall"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="has_hall" className="cursor-pointer">Has Living Room/Hall</Label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={methods.control}
                    name="has_separate_kitchen"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_separate_kitchen"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="has_separate_kitchen" className="cursor-pointer">Separate Kitchen</Label>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={methods.control}
                name="nearby_college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearby College/University</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select college or type your own" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {popularColleges.map((college) => (
                          <SelectItem key={college} value={college}>
                            {college}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other (specify in description)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="available_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restrictions & Rules</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Gate closing time at 10 PM, no overnight guests, etc."
                        {...field}
                        className="mt-1 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property. Include details about amenities, furnishings, distance to campus, and other relevant information for students."
                        {...field}
                        className="mt-1 min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <>
            <div className="glass rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Image className="mr-2 text-primary" size={20} />
                Property Images & Videos
              </h2>
              
              <div className="space-y-4">
                <MediaUploader 
                  onMediaChange={handleMediaChange}
                  initialMedia={media}
                  maxImages={10}
                  maxVideos={5}
                />
              </div>
            </div>
            
            <div className="glass rounded-xl p-6 space-y-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="mr-2 text-primary" size={20} />
                Property Location
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Search for your address or landmark, then fine-tune the exact location by dragging the marker.
                </p>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  defaultLocation={coordinates}
                  height="400px"
                  zoom={15}
                  onChange={(location) => {
                    console.log("Location changed:", location);
                  }}
                  value=""
                />
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <User className="mr-2 text-primary" size={20} />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <FormField
                control={methods.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., John Doe"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="e.g., john@example.com"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={methods.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., +91 9876543210"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="p-4 bg-muted/50 rounded-lg mt-4">
                <h3 className="font-medium mb-2">Review Your Listing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Title:</span>
                    <span className="text-muted-foreground">{formValues.title}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Price:</span>
                    <span className="text-muted-foreground">₹{formValues.price}/month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Deposit:</span>
                    <span className="text-muted-foreground">{formValues.deposit_amount ? `₹${formValues.deposit_amount}` : 'Not specified'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Type:</span>
                    <span className="text-muted-foreground">{formValues.property_type === 'pg' ? 'PG Accommodation' : 'Rental'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">For:</span>
                    <span className="text-muted-foreground">
                      {formValues.gender_preference === 'boys' ? 'Boys Only' : 
                       formValues.gender_preference === 'girls' ? 'Girls Only' : 'Anyone (No Preference)'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Floor:</span>
                    <span className="text-muted-foreground">
                      {formValues.floor_number === '0' ? 'Ground Floor' : `${formValues.floor_number}${
                        formValues.floor_number === '1' ? 'st' : 
                        formValues.floor_number === '2' ? 'nd' : 
                        formValues.floor_number === '3' ? 'rd' : 'th'} Floor`}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Rooms:</span>
                    <span className="text-muted-foreground">{formValues.bedrooms} BR, {formValues.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Area:</span>
                    <span className="text-muted-foreground">{formValues.square_feet} sq ft</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Address:</span>
                    <span className="text-muted-foreground">{formValues.address}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Available:</span>
                    <span className="text-muted-foreground">{new Date(formValues.available_from).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Near:</span>
                    <span className="text-muted-foreground">{formValues.nearby_college}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Features:</span>
                    <span className="text-muted-foreground">
                      {formValues.has_hall ? 'Hall, ' : ''}
                      {formValues.has_separate_kitchen ? 'Separate Kitchen' : ''}
                      {!formValues.has_hall && !formValues.has_separate_kitchen ? 'Standard' : ''}
                    </span>
                  </div>
                </div>
                {formValues.restrictions && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Restrictions:</span>
                    <p className="text-sm text-muted-foreground mt-1">{formValues.restrictions}</p>
                  </div>
                )}
                {media.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Media:</span>
                    <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                      {media.map((item, idx) => (
                        <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-md">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={`Property preview ${idx+1}`} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-black">
                              <span className="text-xs text-white">Video</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          
          <div className="flex items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${formStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${formStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>
          
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
