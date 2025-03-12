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
  const [formData, setFormData] = useState({
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
  });

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

  const handleLocationSelect = (coords: Coordinates) => {
    console.log("Selected coordinates:", coords);
    setCoordinates(coords);
  };

  const handleMediaChange = (newMedia: MediaItem[]) => {
    setMedia(newMedia);
  };

  const validateForm = () => {
    if (formStep === 1) {
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
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateForm()) {
      setFormStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert numeric fields
      const numericPrice = parseFloat(formData.price);
      const numericBedrooms = parseInt(formData.bedrooms);
      const numericBathrooms = parseInt(formData.bathrooms);
      const numericSquareFeet = parseInt(formData.square_feet);
      const numericFloorNumber = parseInt(formData.floor_number);
      const numericDepositAmount = formData.deposit_amount ? parseFloat(formData.deposit_amount) : null;
      
      console.log("Submitting property with coordinates:", coordinates);
      console.log("Uploading media:", media);
      console.log("Form data:", formData);

      // Data validation before insert
      if (!formData.title || !formData.address || isNaN(numericPrice) || !coordinates.lat || !coordinates.lng) {
        throw new Error("Required fields are missing");
      }

      if (media.length === 0) {
        throw new Error("At least one image or video is required");
      }

      // Get first image for the main image_url
      const mainImageUrl = media.find(item => item.type === 'image')?.url || media[0].url;

      // Create the property record
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title: formData.title,
            address: formData.address,
            price: numericPrice,
            bedrooms: numericBedrooms,
            bathrooms: numericBathrooms,
            square_feet: numericSquareFeet,
            description: formData.description,
            available_from: formData.available_from,
            image_url: mainImageUrl, // First image as the main image
            media: media, // All media items
            contact_name: formData.contact_name,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            has_hall: formData.has_hall,
            has_separate_kitchen: formData.has_separate_kitchen,
            nearby_college: formData.nearby_college || "Not specified",
            // New fields
            floor_number: numericFloorNumber,
            property_type: formData.property_type,
            gender_preference: formData.gender_preference,
            restrictions: formData.restrictions,
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
              <div>
                <Label htmlFor="title">Listing Title</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="e.g., Cozy 2BR Apartment near KJC"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  name="address"
                  placeholder="e.g., 123 College St, Bangalore"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Rent (₹)</Label>
                  <Input 
                    id="price"
                    name="price"
                    type="number"
                    placeholder="e.g., 15000"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deposit_amount">Security Deposit (₹)</Label>
                  <Input 
                    id="deposit_amount"
                    name="deposit_amount"
                    type="number"
                    placeholder="e.g., 30000"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${formData.property_type === 'rental' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                    <input
                      type="radio"
                      name="property_type"
                      value="rental"
                      checked={formData.property_type === 'rental'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Building className="mr-2" size={18} />
                    Rental
                  </label>
                  
                  <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${formData.property_type === 'pg' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                    <input
                      type="radio"
                      name="property_type"
                      value="pg"
                      checked={formData.property_type === 'pg'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <User2 className="mr-2" size={18} />
                    PG Accommodation
                  </label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="gender_preference">Gender Preference</Label>
                <div className="flex gap-4 mt-2">
                  <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${formData.gender_preference === 'boys' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                    <input
                      type="radio"
                      name="gender_preference"
                      value="boys"
                      checked={formData.gender_preference === 'boys'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    Boys Only
                  </label>
                  
                  <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${formData.gender_preference === 'girls' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                    <input
                      type="radio"
                      name="gender_preference"
                      value="girls"
                      checked={formData.gender_preference === 'girls'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    Girls Only
                  </label>
                  
                  <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${formData.gender_preference === 'any' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                    <input
                      type="radio"
                      name="gender_preference"
                      value="any"
                      checked={formData.gender_preference === 'any'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    No Preference
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select 
                    value={formData.bedrooms} 
                    onValueChange={(value) => handleSelectChange('bedrooms', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select 
                    value={formData.bathrooms} 
                    onValueChange={(value) => handleSelectChange('bathrooms', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                      <SelectItem value="4">4+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="floor_number">Floor Number</Label>
                  <Select 
                    value={formData.floor_number} 
                    onValueChange={(value) => handleSelectChange('floor_number', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
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
                </div>
              </div>
              
              <div>
                <Label htmlFor="square_feet">Area (sq ft)</Label>
                <Select 
                  value={formData.square_feet} 
                  onValueChange={(value) => handleSelectChange('square_feet', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">Under 500 sq ft</SelectItem>
                    <SelectItem value="800">500-800 sq ft</SelectItem>
                    <SelectItem value="1000">800-1000 sq ft</SelectItem>
                    <SelectItem value="1500">1000-1500 sq ft</SelectItem>
                    <SelectItem value="2000">1500+ sq ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Additional Features</Label>
                <div className="flex flex-wrap gap-4 mt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has_hall"
                      name="has_hall"
                      checked={formData.has_hall}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="has_hall" className="cursor-pointer">Has Living Room/Hall</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has_separate_kitchen"
                      name="has_separate_kitchen"
                      checked={formData.has_separate_kitchen}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="has_separate_kitchen" className="cursor-pointer">Separate Kitchen</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="nearby_college">Nearby College/University</Label>
                <Select 
                  value={formData.nearby_college} 
                  onValueChange={(value) => handleSelectChange('nearby_college', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select college or type your own" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularColleges.map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (specify in description)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="available_from">Available From</Label>
                <Input 
                  id="available_from"
                  name="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="restrictions">Restrictions & Rules</Label>
                <Textarea 
                  id="restrictions"
                  name="restrictions"
                  placeholder="e.g., Gate closing time at 10 PM, no overnight guests, etc."
                  value={formData.restrictions}
                  onChange={handleChange}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Describe your property. Include details about amenities, furnishings, distance to campus, and other relevant information for students."
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 min-h-[120px]"
                />
              </div>
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
              <div>
                <Label htmlFor="contact_name">Your Name</Label>
                <Input 
                  id="contact_name"
                  name="contact_name"
                  placeholder="e.g., John Doe"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input 
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input 
                  id="contact_phone"
                  name="contact_phone"
                  placeholder="e.g., +91 9876543210"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg mt-4">
                <h3 className="font-medium mb-2">Review Your Listing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Title:</span>
                    <span className="text-muted-foreground">{formData.title}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Price:</span>
                    <span className="text-muted-foreground">₹{formData.price}/month</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Deposit:</span>
                    <span className="text-muted-foreground">{formData.deposit_amount ? `₹${formData.deposit_amount}` : 'Not specified'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Type:</span>
                    <span className="text-muted-foreground">{formData.property_type === 'pg' ? 'PG Accommodation' : 'Rental'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">For:</span>
                    <span className="text-muted-foreground">
                      {formData.gender_preference === 'boys' ? 'Boys Only' : 
                       formData.gender_preference === 'girls' ? 'Girls Only' : 'Anyone (No Preference)'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Floor:</span>
                    <span className="text-muted-foreground">
                      {formData.floor_number === '0' ? 'Ground Floor' : `${formData.floor_number}${
                        formData.floor_number === '1' ? 'st' : 
                        formData.floor_number === '2' ? 'nd' : 
                        formData.floor_number === '3' ? 'rd' : 'th'} Floor`}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Rooms:</span>
                    <span className="text-muted-foreground">{formData.bedrooms} BR, {formData.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Area:</span>
                    <span className="text-muted-foreground">{formData.square_feet} sq ft</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Address:</span>
                    <span className="text-muted-foreground">{formData.address}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Available:</span>
                    <span className="text-muted-foreground">{new Date(formData.available_from).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Near:</span>
                    <span className="text-muted-foreground">{formData.nearby_college}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Features:</span>
                    <span className="text-muted-foreground">
                      {formData.has_hall ? 'Hall, ' : ''}
                      {formData.has_separate_kitchen ? 'Separate Kitchen' : ''}
                      {!formData.has_hall && !formData.has_separate_kitchen ? 'Standard' : ''}
                    </span>
                  </div>
                </div>
                {formData.restrictions && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Restrictions:</span>
                    <p className="text-sm text-muted-foreground mt-1">{formData.restrictions}</p>
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
