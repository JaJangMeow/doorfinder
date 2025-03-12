
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building, User2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormData } from "@/types/property";

interface PropertyDetailsFormProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

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

const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({
  formData,
  handleChange,
  handleCheckboxChange,
  handleSelectChange,
}) => {
  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold flex items-center">
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
};

export default PropertyDetailsForm;
