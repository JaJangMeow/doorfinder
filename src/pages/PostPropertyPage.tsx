
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import LocationPicker from "@/components/LocationPicker";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Home, Calendar, User, Mail, Phone, Upload } from "lucide-react";

interface Coordinates {
  lat: number;
  lng: number;
}

const PostPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 12.9716, lng: 77.5946 });
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    description: "",
    available_from: "",
    nearby_college: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (coords: Coordinates) => {
    console.log("Selected coordinates:", coords);
    setCoordinates(coords);
    toast({
      title: "Location updated",
      description: `Location set to: Lat ${coords.lat.toFixed(6)}, Lng ${coords.lng.toFixed(6)}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Convert price and bedrooms to numbers
      const numericPrice = parseFloat(formData.price);
      const numericBedrooms = parseInt(formData.bedrooms);
      
      if (isNaN(numericPrice) || isNaN(numericBedrooms)) {
        throw new Error("Price and bedrooms must be valid numbers");
      }

      console.log("Submitting property with coordinates:", coordinates);

      // Create the property record with location coordinates
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title: formData.title,
            address: formData.address,
            price: numericPrice,
            bedrooms: numericBedrooms,
            description: `${formData.description}\n\nNearby College: ${formData.nearby_college}\n\nLocation Coordinates: ${coordinates.lat}, ${coordinates.lng}`,
            available_from: formData.available_from || new Date().toISOString().split('T')[0],
            image_url: formData.image_url,
            contact_name: formData.contact_name,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
            latitude: coordinates.lat,
            longitude: coordinates.lng
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your property has been posted successfully.",
      });
      
      navigate('/search');
    } catch (error) {
      console.error('Error posting property:', error);
      toast({
        title: "Error",
        description: "Failed to post property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Post Your Student Housing</h1>
          <p className="text-muted-foreground mb-8">
            Help other students find housing near your college campus.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
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
                    required
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
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input 
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      placeholder="e.g., 2"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nearby_college">Nearby College/University</Label>
                  <Input 
                    id="nearby_college"
                    name="nearby_college"
                    placeholder="e.g., Kristu Jayanti College (KJC)"
                    value={formData.nearby_college}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input 
                    id="available_from"
                    name="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Describe your property, including details about amenities, distance to campus, etc."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                
                <div>
                  <Label className="block mb-2">Property Location (Drag the marker to set exact location)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click and drag the marker to the exact location of your property. This helps students find your property more easily.
                  </p>
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    defaultLocation={coordinates}
                    height="400px"
                    zoom={15}
                  />
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <MapPin size={16} className="mr-1" />
                    <span>Selected coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>
            
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
                    required
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
                    required
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
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Posting..." : "Post Property"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default PostPropertyPage;
